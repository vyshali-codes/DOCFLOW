import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { CreditCard, Check, ArrowRight, ShieldCheck } from "lucide-react";

import { useAppContext } from "../lib/AppContext";

import { fileService } from "../lib/fileService";

import { toast } from "react-toastify";

export default function Checkout() {
  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useAppContext();

  const searchParams = new URLSearchParams(location.search);

  const plan = searchParams.get("plan") || "pro";

  const [isProcessing, setIsProcessing] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "upi" | "netbanking"
  >("card");

  const planDetails = {
    pro: {
      name: "Pro",
      price: 299,
      storage: "250 GB",
      limit: 250 * 1024 * 1024 * 1024,
    },
    business: {
      name: "Business",
      price: 999,
      storage: "2 TB",
      limit: 2 * 1024 * 1024 * 1024 * 1024,
    },
  }[plan] || {
    name: "Pro",
    price: 299,
    storage: "250 GB",
    limit: 250 * 1024 * 1024 * 1024,
  };
  const gst = Math.round(planDetails.price * 0.18);

  const total = planDetails.price + gst;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsProcessing(true);

    if (paymentMethod === "upi") {
      toast.info(
        "UPI Payment Initiated. Please approve the request on your mobile app.",
        {
          autoClose: 3000,
        }
      );
    } else if (paymentMethod === "netbanking") {
      toast.info("Redirecting to your bank's secure portal...", {
        autoClose: 2000,
      });
    }

    /* Simulate payment processing */ setTimeout(async () => {
      try {
        if (paymentMethod === "upi") {
          const upiId = (
            document.getElementById("upi-id-input") as HTMLInputElement
          )?.value;

          if (upiId === "fail@upi") {
            throw new Error("UPI Payment declined by user or bank.");
          }
        } else if (paymentMethod === "netbanking") {
          const bank = (
            document.getElementById("bank-select") as HTMLSelectElement
          )?.value;

          if (bank === "fail") {
            throw new Error("Net Banking authorization failed.");
          }
        }

        await fileService.updateSubscription(user.id, plan, planDetails.limit);

        setIsProcessing(false);

        setIsSuccess(true);

        toast.success("Payment successful!");
      } catch (err) {
        console.error(err);

        setIsProcessing(false);

        toast.error("Failed to process payment. Please try again.");
      }
    }, 3000);
  };
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
        {" "}
        <div className="bg-theme-card max-w-md w-full rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-8 text-center border border-theme-border">
          {" "}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {" "}
            <Check className="w-8 h-8 text-green-600" />{" "}
          </div>{" "}
          <h2 className="text-2xl font-bold text-theme-text mb-2">
            Payment Successful!
          </h2>{" "}
          <p className="text-theme-muted mb-8">
            {" "}
            You have successfully upgraded to the {planDetails.name}
            plan.{" "}
          </p>{" "}
          <div className="bg-theme-bg rounded-xl p-4 mb-8 text-left border border-theme-border">
            {" "}
            <div className="flex justify-between mb-2">
              {" "}
              <span className="text-theme-muted text-sm">
                New Storage Limit
              </span>{" "}
              <span className="font-semibold text-theme-text text-sm">
                {planDetails.storage}{" "}
              </span>{" "}
            </div>{" "}
            <div className="flex justify-between mb-2">
              {" "}
              <span className="text-theme-muted text-sm">Amount Paid</span>{" "}
              <span className="font-semibold text-theme-text text-sm">
                ₹{total}{" "}
              </span>{" "}
            </div>{" "}
            <div className="flex justify-between">
              {" "}
              <span className="text-theme-muted text-sm">
                Next Billing Date
              </span>{" "}
              <span className="font-semibold text-theme-text text-sm">
                {" "}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="space-y-3">
            {" "}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {" "}
              Go to Dashboard <ArrowRight className="w-4 h-4" />{" "}
            </button>{" "}
            <button className="w-full bg-theme-card border border-theme-border hover:bg-theme-bg text-theme-text py-3 px-4 rounded-xl font-medium transition-colors text-sm">
              {" "}
              Download Invoice{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg py-12 px-4 sm:px-6 lg:px-8">
      {" "}
      <div className="max-w-4xl mx-auto">
        {" "}
        <div className="mb-8">
          {" "}
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-theme-muted hover:text-theme-text transition-colors"
          >
            {" "}
            ← Back to pricing{" "}
          </button>{" "}
        </div>{" "}
        <div className="bg-theme-card rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-theme-border overflow-hidden flex flex-col md:flex-row">
          {" "}
          {/* Order Summary (Left side on desktop) */}{" "}
          <div className="md:w-1/3 bg-theme-bg text-white p-8">
            {" "}
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>{" "}
            <div className="bg-theme-card rounded-xl p-4 mb-6 border border-theme-border">
              {" "}
              <div className="text-sm text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
                {planDetails.name}
                Plan
              </div>{" "}
              <div className="flex items-baseline gap-1">
                {" "}
                <span className="text-sm">₹</span>{" "}
                <span className="text-3xl font-bold">{planDetails.price}</span>{" "}
                <span className="text-theme-muted text-sm">/month</span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-theme-border">
              {" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-theme-muted">Subtotal</span>{" "}
                <span>₹{planDetails.price}</span>{" "}
              </div>{" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-theme-muted">GST (18%)</span>{" "}
                <span>₹{gst}</span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex justify-between items-end mb-8">
              {" "}
              <span className="font-medium text-slate-300">Total</span>{" "}
              <span className="text-2xl font-bold">₹{total}</span>{" "}
            </div>{" "}
            <div className="space-y-4">
              {" "}
              <div className="flex items-start gap-3">
                {" "}
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />{" "}
                <span className="text-sm text-slate-300">
                  Instant access to {planDetails.storage}
                  storage
                </span>{" "}
              </div>{" "}
              <div className="flex items-start gap-3">
                {" "}
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />{" "}
                <span className="text-sm text-slate-300">
                  Cancel anytime, no questions asked
                </span>{" "}
              </div>{" "}
              <div className="flex items-start gap-3">
                {" "}
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />{" "}
                <span className="text-sm text-slate-300">
                  Secure 256-bit encrypted checkout
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Payment Form (Right side) */}{" "}
          <div className="md:w-2/3 p-8">
            {" "}
            <h2 className="text-xl font-bold text-theme-text mb-6">
              Payment Details
            </h2>{" "}
            <form onSubmit={handleCheckout}>
              {" "}
              <div className="space-y-5">
                {" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-theme-text mb-1">
                    Email Address
                  </label>{" "}
                  <input
                    type="email"
                    defaultValue={user?.email}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Payment Method
                  </label>{" "}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {" "}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2.5 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                        paymentMethod === "card"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-theme-border text-theme-muted hover:bg-theme-bg"
                      }
 `}
                    >
                      {" "}
                      <CreditCard className="w-4 h-4" /> Card{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`py-2.5 border rounded-lg text-sm font-medium ${
                        paymentMethod === "upi"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-theme-border text-theme-muted hover:bg-theme-bg"
                      }
 `}
                    >
                      {" "}
                      UPI{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`py-2.5 border rounded-lg text-sm font-medium ${
                        paymentMethod === "netbanking"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-theme-border text-theme-muted hover:bg-theme-bg"
                      }
 `}
                    >
                      {" "}
                      Net Banking{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                {paymentMethod === "card" && (
                  <>
                    {" "}
                    <div>
                      {" "}
                      <label className="block text-sm font-medium text-theme-text mb-1">
                        Card Information
                      </label>{" "}
                      <div className="border border-theme-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        {" "}
                        <input
                          type="text"
                          placeholder="Card number"
                          required
                          className="w-full px-4 py-3 outline-none text-sm border-b border-theme-border"
                        />{" "}
                        <div className="flex">
                          {" "}
                          <input
                            type="text"
                            placeholder="MM / YY"
                            required
                            className="w-1/2 px-4 py-3 outline-none text-sm border-r border-theme-border"
                          />{" "}
                          <input
                            type="text"
                            placeholder="CVC"
                            required
                            className="w-1/2 px-4 py-3 outline-none text-sm"
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-sm font-medium text-theme-text mb-1">
                        Cardholder Name
                      </label>{" "}
                      <input
                        type="text"
                        placeholder="Full name on card"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      />{" "}
                    </div>{" "}
                  </>
                )}{" "}
                {paymentMethod === "upi" && (
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-theme-text mb-1">
                      UPI ID
                    </label>{" "}
                    <input
                      type="text"
                      placeholder="e.g. name@upi"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />{" "}
                  </div>
                )}{" "}
                {paymentMethod === "netbanking" && (
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-theme-text mb-1">
                      Select Bank
                    </label>{" "}
                    <select
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-theme-card"
                    >
                      {" "}
                      <option value="">Select your bank...</option>{" "}
                      <option value="sbi">State Bank of India</option>{" "}
                      <option value="hdfc">HDFC Bank</option>{" "}
                      <option value="icici">ICICI Bank</option>{" "}
                      <option value="axis">Axis Bank</option>{" "}
                      <option value="kotak">Kotak Mahindra Bank</option>{" "}
                    </select>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              <div className="mt-8 pt-6 border-t border-theme-border flex items-center justify-between">
                {" "}
                <div className="flex items-center gap-2 text-theme-muted text-xs">
                  {" "}
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Payments
                  are secure and encrypted{" "}
                </div>{" "}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {" "}
                  {isProcessing ? <>Processing...</> : <>Pay ₹{total}</>}{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
