/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  DocFlow — Jenkins Declarative Pipeline (GitHub Integration)            ║
 * ║                                                                          ║
 * ║  Required Jenkins Plugins:                                               ║
 * ║    • Git Plugin                                                          ║
 * ║    • GitHub Plugin          (webhook trigger + commit status)            ║
 * ║    • NodeJS Plugin          (Node-20 installation configured in Jenkins) ║
 * ║    • Docker Pipeline Plugin                                              ║
 * ║    • SSH Agent Plugin       (for remote deploy)                          ║
 * ║                                                                          ║
 * ║  Jenkins Credentials needed (Manage Jenkins → Credentials):             ║
 * ║    • github-credentials         → Username/Password or Personal Token   ║
 * ║    • DOCKER_REGISTRY            → Secret Text  (e.g. docker.io/yourorg) ║
 * ║    • docker-hub-credentials     → Username/Password (Docker Hub)        ║
 * ║    • GEMINI_API_KEY             → Secret Text                            ║
 * ║    • FIREBASE_API_KEY           → Secret Text                            ║
 * ║    • FIREBASE_AUTH_DOMAIN       → Secret Text                            ║
 * ║    • FIREBASE_PROJECT_ID        → Secret Text                            ║
 * ║    • FIREBASE_STORAGE_BUCKET    → Secret Text                            ║
 * ║    • FIREBASE_MESSAGING_SENDER_ID → Secret Text                         ║
 * ║    • FIREBASE_APP_ID            → Secret Text                            ║
 * ║    • APP_URL                    → Secret Text                            ║
 * ║    • deploy-server-ssh          → SSH Username with Private Key          ║
 * ║                                                                          ║
 * ║  GitHub Webhook Setup:                                                   ║
 * ║    Repository → Settings → Webhooks → Add webhook                       ║
 * ║    Payload URL : http://<JENKINS_URL>/github-webhook/                   ║
 * ║    Content type: application/json                                        ║
 * ║    Events      : Pushes + Pull Requests                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

pipeline {
    agent any

    // ─── Global Environment ────────────────────────────────────────────────────
    environment {
        // ── App ────────────────────────────────────────────────────────────────
        APP_NAME        = 'docflow'
        NODE_VERSION    = '20'
        COMPOSE_FILE    = 'docker-compose.yml'

        // ── GitHub ─────────────────────────────────────────────────────────────
        // Credential ID for GitHub (used in checkout + commit status)
        GITHUB_CREDS        = 'github-credentials'
        // GitHub repo
        GITHUB_REPO_URL     = 'https://github.com/vyshali-codes/docflow.git'
        GITHUB_REPO         = 'vyshali-codes/docflow'    // used for commit status API

        // ── Docker ─────────────────────────────────────────────────────────────
        DOCKER_REGISTRY = credentials('DOCKER_REGISTRY')
        DOCKER_CREDS    = 'docker-hub-credentials'
        IMAGE_NAME      = "${DOCKER_REGISTRY}/${APP_NAME}"

        // Sanitise branch name so it's a valid Docker tag segment.
        // GitHub sends refs like "origin/main" or "origin/feature/my-branch".
        BRANCH_SLUG = "${env.GIT_BRANCH?.replaceAll('origin/', '')
                                         .replaceAll('[^a-zA-Z0-9._-]', '-') ?: 'latest'}"
        IMAGE_TAG   = "${BRANCH_SLUG}-${env.BUILD_NUMBER}"

        // ── App Secrets ────────────────────────────────────────────────────────
        GEMINI_API_KEY               = credentials('GEMINI_API_KEY')
        FIREBASE_API_KEY             = credentials('FIREBASE_API_KEY')
        FIREBASE_AUTH_DOMAIN         = credentials('FIREBASE_AUTH_DOMAIN')
        FIREBASE_PROJECT_ID          = credentials('FIREBASE_PROJECT_ID')
        FIREBASE_STORAGE_BUCKET      = credentials('FIREBASE_STORAGE_BUCKET')
        FIREBASE_MESSAGING_SENDER_ID = credentials('FIREBASE_MESSAGING_SENDER_ID')
        FIREBASE_APP_ID              = credentials('FIREBASE_APP_ID')
        APP_URL                      = credentials('APP_URL')
    }

    // ─── Options ───────────────────────────────────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        // Show nicer stage names in the GitHub checks UI
        skipStagesAfterUnstable()
    }

    // ─── Triggers ──────────────────────────────────────────────────────────────
    triggers {
        // Fires on every GitHub push / PR event via webhook.
        // GitHub webhook URL: http://<JENKINS_URL>/github-webhook/
        githubPush()
    }

    // ─── Stages ────────────────────────────────────────────────────────────────
    stages {

        // ── 1. Checkout from GitHub ────────────────────────────────────────────
        stage('Checkout') {
            steps {
                // Report "pending" status to GitHub immediately
                githubNotify(
                    context     : 'ci/jenkins',
                    status      : 'PENDING',
                    description : 'Build started',
                    credentialsId: env.GITHUB_CREDS,
                    repo        : env.GITHUB_REPO,
                    sha         : env.GIT_COMMIT ?: 'HEAD',
                    targetUrl   : env.BUILD_URL
                )

                checkout([
                    $class                           : 'GitSCM',
                    branches                         : [[name: env.GIT_BRANCH ?: '*/main']],
                    userRemoteConfigs                : [[
                        url           : env.GITHUB_REPO_URL,
                        credentialsId : env.GITHUB_CREDS
                    ]],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'PruneStaleBranch']
                    ]
                ])

                script {
                    // Make commit SHA available for later notifications
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    echo "GitHub repo : ${GITHUB_REPO_URL}"
                    echo "Branch      : ${GIT_BRANCH}"
                    echo "Commit      : ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        // ── 2. Setup Node.js ───────────────────────────────────────────────────
        stage('Setup Node.js') {
            steps {
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    sh 'node --version && npm --version'
                }
            }
        }

        // ── 3. Install Dependencies ────────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    // npm ci uses package-lock.json for reproducible installs
                    sh 'npm ci --prefer-offline'
                }
            }
        }

        // ── 4. Lint / Type-check ───────────────────────────────────────────────
        stage('Lint') {
            steps {
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    // npm run lint → tsc --noEmit
                    sh 'npm run lint'
                }
            }
        }

        // ── 5. Build ───────────────────────────────────────────────────────────
        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    // Vite (frontend → dist/) + esbuild (server → dist/server.cjs)
                    sh 'npm run build'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true
                }
            }
        }

        // ── 6. Write .env for Docker context ──────────────────────────────────
        stage('Prepare .env') {
            steps {
                // Secrets are injected by Jenkins — they are NEVER stored in git
                sh '''
                    cat > .env <<EOF
GEMINI_API_KEY=${GEMINI_API_KEY}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
FIREBASE_APP_ID=${FIREBASE_APP_ID}
APP_URL=${APP_URL}
EOF
                '''
            }
        }

        // ── 7. Docker Build ────────────────────────────────────────────────────
        stage('Docker Build') {
            steps {
                script {
                    echo "Building image: ${IMAGE_NAME}:${IMAGE_TAG}"
                    // --network=host lets the build container reach npm registry directly
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}", '--no-cache --network=host .')
                }
            }
        }

        // ── 8. Docker Push ─────────────────────────────────────────────────────
        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry("https://index.docker.io/v1/", env.DOCKER_CREDS) {
                        def img = docker.image("${IMAGE_NAME}:${IMAGE_TAG}")
                        img.push()

                        // Tag 'latest' only for the default branch
                        if (env.BRANCH_SLUG == 'main' || env.BRANCH_SLUG == 'master') {
                            img.push('latest')
                            echo "Also pushed: ${IMAGE_NAME}:latest"
                        }
                    }
                }
            }
        }

        // ── 9. Deploy via Docker Compose (main / master only) ─────────────────
        stage('Deploy') {
            when {
                // Only deploy from the default branch — not from feature branches or PRs
                anyOf {
                    expression { env.BRANCH_SLUG == 'main' }
                    expression { env.BRANCH_SLUG == 'master' }
                }
            }
            steps {
                // Prerequisites on the remote server:
                //   /opt/docflow/.env          → production secrets
                //   docker-compose.yml         → uploaded by this step each run
                sshagent(credentials: ['deploy-server-ssh']) {
                    sh """
                        echo "Uploading docker-compose.yml to server..."
                        scp -o StrictHostKeyChecking=no ${COMPOSE_FILE} \\
                            deploy@YOUR_SERVER_IP:/opt/${APP_NAME}/docker-compose.yml

                        echo "Deploying ${IMAGE_NAME}:${IMAGE_TAG} via Docker Compose..."
                        ssh -o StrictHostKeyChecking=no deploy@YOUR_SERVER_IP '
                            cd /opt/${APP_NAME} &&
                            export IMAGE_NAME=${IMAGE_NAME} &&
                            export IMAGE_TAG=${IMAGE_TAG} &&
                            docker compose pull app &&
                            docker compose up -d --remove-orphans &&
                            docker compose ps
                        '
                    """
                }
            }
            post {
                success {
                    echo "Deployed ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        // ── 10. Smoke Test (main / master only) ───────────────────────────────
        stage('Smoke Test') {
            when {
                anyOf {
                    expression { env.BRANCH_SLUG == 'main' }
                    expression { env.BRANCH_SLUG == 'master' }
                }
            }
            steps {
                sshagent(credentials: ['deploy-server-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no deploy@YOUR_SERVER_IP '
                            echo "Waiting for container to become healthy..." &&
                            sleep 10 &&
                            curl --fail --silent --max-time 10 \\
                                http://localhost:3000/api/health | grep ok &&
                            echo "Smoke test PASSED"
                        '
                    """
                }
            }
        }
    }

    // ─── Post Actions — runs after ALL stages ──────────────────────────────────
    post {
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }

        success {
            // Update the GitHub commit with a green check
            githubNotify(
                context     : 'ci/jenkins',
                status      : 'SUCCESS',
                description : "Build #${BUILD_NUMBER} passed · ${env.GIT_COMMIT_SHORT}",
                credentialsId: env.GITHUB_CREDS,
                repo        : env.GITHUB_REPO,
                sha         : env.GIT_COMMIT ?: 'HEAD',
                targetUrl   : env.BUILD_URL
            )
            echo "Pipeline succeeded — ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            // Update the GitHub commit with a red cross
            githubNotify(
                context     : 'ci/jenkins',
                status      : 'FAILURE',
                description : "Build #${BUILD_NUMBER} failed",
                credentialsId: env.GITHUB_CREDS,
                repo        : env.GITHUB_REPO,
                sha         : env.GIT_COMMIT ?: 'HEAD',
                targetUrl   : env.BUILD_URL
            )
            echo "Pipeline FAILED — check the logs at ${BUILD_URL}"
            // Uncomment to send email:
            // mail to: 'team@example.com',
            //      subject: "DocFlow #${BUILD_NUMBER} FAILED [${BRANCH_SLUG}]",
            //      body:    "Details: ${BUILD_URL}"
        }

        aborted {
            githubNotify(
                context     : 'ci/jenkins',
                status      : 'ERROR',
                description : "Build #${BUILD_NUMBER} was aborted",
                credentialsId: env.GITHUB_CREDS,
                repo        : env.GITHUB_REPO,
                sha         : env.GIT_COMMIT ?: 'HEAD',
                targetUrl   : env.BUILD_URL
            )
        }
    }
}
