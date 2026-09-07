import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Check, Star, Zap, Building2, Shield, ArrowRight } from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();

  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for individuals getting started.",
      storage: "15 GB",
      features: [
        "Upload files",
        "Create folders",
        "Share files",
        "Basic version history",
        "Basic search",
        "PDF preview",
        "Dark mode",
      ],
      missing: ["Priority support", "Advanced analytics", "Team management"],
      buttonText: "Current Plan",
      buttonVariant: "outline",
      icon: <Star className="w-5 h-5 text-theme-muted" />,
    },
    {
      name: "Pro",
      price: isAnnual ? "249" : "299",
      description: "Ideal for professionals and small teams.",
      storage: "250 GB",
      popular: true,
      features: [
        "Everything in Free, plus:",
        "Advanced file sharing",
        "Unlimited version history",
        "Team collaboration (up to 25)",
        "Comments and mentions",
        "File recovery",
        "Advanced search filters",
        "Priority email support",
      ],
      missing: [],
      buttonText: "Upgrade to Pro",
      buttonVariant: "primary",
      icon: <Zap className="w-5 h-5 text-blue-500" />,
    },
    {
      name: "Business",
      price: isAnnual ? "799" : "999",
      description: "For growing organizations needing control.",
      storage: "2 TB",
      features: [
        "Everything in Pro, plus:",
        "Role management",
        "Team administration",
        "Audit logs",
        "Organization analytics",
        "Custom permissions",
        "API Access",
        "Workspace branding",
        "Security policies",
      ],
      missing: [],
      buttonText: "Upgrade to Business",
      buttonVariant: "outline",
      icon: <Building2 className="w-5 h-5 text-purple-500" />,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Advanced security and support for large scale.",
      storage: "Unlimited",
      features: [
        "Everything in Business, plus:",
        "Unlimited Members & Workspaces",
        "Dedicated Support",
        "Custom Integrations",
        "SSO Login",
        "Advanced Security",
        "Custom Deployment",
        "Service Level Agreement",
        "Dedicated Account Manager",
      ],
      missing: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      icon: <Shield className="w-5 h-5 text-cyan-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg overflow-y-auto pb-24">
      {" "}
      {/* Header */}{" "}
      <div className="bg-theme-bg text-white pt-20 pb-32 px-4 relative overflow-hidden">
        {" "}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {" "}
          <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-600/20 blur-3xl" />{" "}
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-cyan-500/20 blur-3xl" />{" "}
        </div>{" "}
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {" "}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {" "}
            Simple, transparent pricing{" "}
          </h1>{" "}
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            {" "}
            Choose the perfect plan for your needs. Always know what you'll pay.{" "}
          </p>{" "}
          <div className="flex items-center justify-center gap-3">
            {" "}
            <span
              className={`text-sm ${
                !isAnnual ? "text-white font-medium" : "text-theme-muted"
              }
 `}
            >
              {" "}
              Monthly{" "}
            </span>{" "}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors focus:outline-none"
            >
              {" "}
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-theme-card transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }
 `}
              />{" "}
            </button>{" "}
            <span
              className={`text-sm flex items-center gap-2 ${
                isAnnual ? "text-white font-medium" : "text-theme-muted"
              }
 `}
            >
              {" "}
              Annually{" "}
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {" "}
                Save 20%{" "}
              </span>{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Pricing Cards */}{" "}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {" "}
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`bg-theme-card rounded-2xl p-8 flex flex-col shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1 duration-200 border ${
                plan.popular
                  ? "border-blue-500 ring-1 ring-blue-500"
                  : "border-theme-border"
              }
 `}
            >
              {" "}
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  {" "}
                  Most Popular{" "}
                </div>
              )}{" "}
              <div className="flex items-center gap-3 mb-2">
                {" "}
                <div className="p-2 bg-theme-bg rounded-lg">
                  {" "}
                  {plan.icon}{" "}
                </div>{" "}
                <h3 className="text-xl font-bold text-theme-text">
                  {" "}
                  {plan.name}{" "}
                </h3>{" "}
              </div>{" "}
              <p className="text-sm text-theme-muted mb-6 min-h-[40px]">
                {" "}
                {plan.description}{" "}
              </p>{" "}
              <div className="mb-6 flex items-baseline gap-1">
                {" "}
                {plan.price !== "Custom" && (
                  <span className="text-2xl font-bold text-theme-text">₹</span>
                )}{" "}
                <span className="text-4xl font-extrabold text-theme-text">
                  {" "}
                  {plan.price}{" "}
                </span>{" "}
                {plan.price !== "Custom" && (
                  <span className="text-theme-muted font-medium">/mo</span>
                )}{" "}
              </div>{" "}
              <div className="mb-8 p-4 bg-theme-bg rounded-xl border border-theme-border flex flex-col items-center justify-center">
                {" "}
                <span className="text-xs text-theme-muted uppercase font-semibold tracking-wider mb-1">
                  {" "}
                  Storage{" "}
                </span>{" "}
                <span className="text-lg font-bold text-theme-text">
                  {" "}
                  {plan.storage}{" "}
                </span>{" "}
              </div>{" "}
              <button
                onClick={() =>
                  plan.price !== "Custom" && plan.name !== "Free"
                    ? navigate(`/checkout?plan=${plan.name.toLowerCase()}
 `)
                    : null
                }
                className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all mb-8 flex items-center justify-center gap-2 ${
                  plan.buttonVariant === "primary"
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    : plan.name === "Free"
                    ? "bg-theme-card-hover text-theme-muted cursor-default"
                    : "bg-theme-card border-2 border-theme-border text-theme-text hover:border-theme-border hover:bg-theme-bg"
                }
 `}
              >
                {" "}
                {plan.buttonText}{" "}
                {plan.buttonVariant === "primary" && (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
              </button>{" "}
              <div className="flex-1">
                {" "}
                <p className="text-xs font-semibold text-theme-text uppercase tracking-wider mb-4">
                  {" "}
                  Features included{" "}
                </p>{" "}
                <ul className="space-y-3">
                  {" "}
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-theme-text"
                    >
                      {" "}
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{" "}
                      <span>{feature}</span>{" "}
                    </li>
                  ))}{" "}
                  {plan.missing.map((feature, idx) => (
                    <li
                      key={`missing-${idx}
 `}
                      className="flex items-start gap-3 text-sm text-theme-muted"
                    >
                      {" "}
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center mt-0.5">
                        {" "}
                        <div className="w-1.5 h-px bg-slate-300"></div>{" "}
                      </div>{" "}
                      <span>{feature}</span>{" "}
                    </li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
