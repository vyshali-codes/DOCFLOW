pipeline {
    agent any

    stages {

        stage('Verify Tools') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci --legacy-peer-deps --ignore-scripts'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t docflow:latest .'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker rm -f docflow-container >NUL 2>&1 || exit /b 0'
                bat 'docker run -d --name docflow-container -p 3001:3000 docflow:latest'
            }
        }

        stage('Health Check') {
            steps {
                bat 'docker ps --filter "name=docflow-container"'
            }
        }
    }

    post {
        success {
            echo 'DocFlow CI/CD Pipeline SUCCESSFUL'
            echo 'Open http://localhost:3001'
        }

        failure {
            echo 'DocFlow CI/CD Pipeline FAILED'
        }
    }
}