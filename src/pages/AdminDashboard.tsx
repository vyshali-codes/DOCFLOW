import React from "react";

import {
  Users,
  HardDrive,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

import { useAppContext } from "../lib/AppContext";

import { mockActivity, mockUsers } from "../lib/mockData";

import { formatBytes } from "../lib/utils";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Mon",
    uploads: 4000,
    downloads: 2400,
  },
  {
    name: "Tue",
    uploads: 3000,
    downloads: 1398,
  },
  {
    name: "Wed",
    uploads: 2000,
    downloads: 9800,
  },
  {
    name: "Thu",
    uploads: 2780,
    downloads: 3908,
  },
  {
    name: "Fri",
    uploads: 1890,
    downloads: 4800,
  },
  {
    name: "Sat",
    uploads: 2390,
    downloads: 3800,
  },
  {
    name: "Sun",
    uploads: 3490,
    downloads: 4300,
  },
];

export default function AdminDashboard() {
  const { user } = useAppContext();

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {" "}
      <div>
        {" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Admin Overview{" "}
        </h1>{" "}
        <p className="text-sm text-theme-muted dark:text-theme-muted mt-1">
          {" "}
          Monitor system performance and user activity.{" "}
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {" "}
        <div className="bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              {" "}
              <Users className="w-5 h-5" />{" "}
            </div>{" "}
            <span className="flex items-center text-sm font-medium text-green-600">
              {" "}
              <ArrowUpRight className="w-4 h-4 mr-1" /> 12%{" "}
            </span>{" "}
          </div>{" "}
          <h3 className="text-sm font-medium text-theme-muted dark:text-theme-muted">
            {" "}
            Total Users{" "}
          </h3>{" "}
          <p className="text-2xl font-bold text-theme-text dark:text-white mt-1">
            {" "}
            2,845{" "}
          </p>{" "}
        </div>{" "}
        <div className="bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {" "}
              <HardDrive className="w-5 h-5" />{" "}
            </div>{" "}
            <span className="flex items-center text-sm font-medium text-green-600">
              {" "}
              <ArrowUpRight className="w-4 h-4 mr-1" /> 5%{" "}
            </span>{" "}
          </div>{" "}
          <h3 className="text-sm font-medium text-theme-muted dark:text-theme-muted">
            {" "}
            Storage Used{" "}
          </h3>{" "}
          <p className="text-2xl font-bold text-theme-text dark:text-white mt-1">
            {" "}
            4.2 TB{" "}
          </p>{" "}
        </div>{" "}
        <div className="bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              {" "}
              <FileText className="w-5 h-5" />{" "}
            </div>{" "}
            <span className="flex items-center text-sm font-medium text-green-600">
              {" "}
              <ArrowUpRight className="w-4 h-4 mr-1" /> 18%{" "}
            </span>{" "}
          </div>{" "}
          <h3 className="text-sm font-medium text-theme-muted dark:text-theme-muted">
            {" "}
            Total Files{" "}
          </h3>{" "}
          <p className="text-2xl font-bold text-theme-text dark:text-white mt-1">
            {" "}
            142,394{" "}
          </p>{" "}
        </div>{" "}
        <div className="bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {" "}
              <Activity className="w-5 h-5" />{" "}
            </div>{" "}
            <span className="flex items-center text-sm font-medium text-red-600">
              {" "}
              <ArrowDownRight className="w-4 h-4 mr-1" /> 2%{" "}
            </span>{" "}
          </div>{" "}
          <h3 className="text-sm font-medium text-theme-muted dark:text-theme-muted">
            {" "}
            Active Sessions{" "}
          </h3>{" "}
          <p className="text-2xl font-bold text-theme-text dark:text-white mt-1">
            {" "}
            842{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <div className="lg:col-span-2 bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm">
          {" "}
          <h2 className="text-lg font-semibold text-theme-text dark:text-white mb-6">
            {" "}
            Traffic Overview{" "}
          </h2>{" "}
          <div className="h-[300px] w-full">
            {" "}
            <ResponsiveContainer width="100%" height="100%">
              {" "}
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                {" "}
                <defs>
                  {" "}
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    {" "}
                    <stop
                      offset="5%"
                      stopColor="#3B82F6"
                      stopOpacity={0.3}
                    />{" "}
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />{" "}
                  </linearGradient>{" "}
                  <linearGradient
                    id="colorDownloads"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    {" "}
                    <stop
                      offset="5%"
                      stopColor="#10B981"
                      stopOpacity={0.3}
                    />{" "}
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />{" "}
                  </linearGradient>{" "}
                </defs>{" "}
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />{" "}
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}
 k`}
                />{" "}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />{" "}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  itemStyle={{
                    color: "#e2e8f0",
                  }}
                />{" "}
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDownloads)"
                />{" "}
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUploads)"
                />{" "}
              </AreaChart>{" "}
            </ResponsiveContainer>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-theme-card p-6 rounded-xl border border-theme-border dark:border-theme-border shadow-sm flex flex-col">
          {" "}
          <h2 className="text-lg font-semibold text-theme-text dark:text-white mb-4">
            {" "}
            Recent Activity{" "}
          </h2>{" "}
          <div className="flex-1 overflow-y-auto">
            {" "}
            {mockActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-8">
                {" "}
                <div className="w-24 h-24 mb-2 flex items-center justify-center opacity-70 mix-blend-multiply">
                  {" "}
                  <img
                    src="https://illustrations.popsy.co/blue/startup-idea.svg"
                    alt="No Activity"
                    className="w-full h-full object-contain"
                  />{" "}
                </div>{" "}
                <h3 className="text-sm font-semibold text-theme-text dark:text-white mb-1">
                  {" "}
                  No Activity Yet{" "}
                </h3>{" "}
                <p className="text-xs text-theme-muted dark:text-theme-muted">
                  {" "}
                  Actions performed on files will appear here.{" "}
                </p>{" "}
              </div>
            ) : (
              <div className="space-y-4">
                {" "}
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {" "}
                    <div className="w-8 h-8 rounded-full bg-theme-card-hover flex items-center justify-center shrink-0">
                      {" "}
                      <User className="w-4 h-4 text-theme-muted" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-sm text-theme-text ">
                        {" "}
                        <span className="font-medium">
                          {" "}
                          {activity.user}{" "}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">{activity.file}</span>{" "}
                      </p>{" "}
                      <p className="text-xs text-theme-muted dark:text-theme-muted mt-0.5">
                        {" "}
                        {activity.time}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {mockActivity.length > 0 && (
            <button className="w-full mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2">
              {" "}
              View all activity{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      <div className="bg-theme-card rounded-xl border border-theme-border dark:border-theme-border shadow-sm overflow-hidden">
        {" "}
        <div className="p-6 border-b border-theme-border dark:border-theme-border flex justify-between items-center">
          {" "}
          <h2 className="text-lg font-semibold text-theme-text dark:text-white">
            {" "}
            Top Users{" "}
          </h2>{" "}
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            {" "}
            View all{" "}
          </button>{" "}
        </div>{" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full text-left border-collapse">
            {" "}
            <thead>
              {" "}
              <tr className="bg-theme-bg /50 text-xs uppercase tracking-wider text-theme-muted dark:text-theme-muted">
                {" "}
                <th className="px-6 py-3 font-medium">User</th>{" "}
                <th className="px-6 py-3 font-medium">Role</th>{" "}
                <th className="px-6 py-3 font-medium">Storage Used</th>{" "}
                <th className="px-6 py-3 font-medium text-right">Status</th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {" "}
              {mockUsers.length === 0 ? (
                <tr>
                  {" "}
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-theme-muted"
                  >
                    {" "}
                    No users found.{" "}
                  </td>{" "}
                </tr>
              ) : (
                mockUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-theme-bg dark:hover:bg-theme-card/80 transition-colors"
                  >
                    {" "}
                    <td className="px-6 py-4 flex items-center gap-3">
                      {" "}
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full"
                      />{" "}
                      <div>
                        {" "}
                        <p className="text-sm font-medium text-theme-text dark:text-white">
                          {" "}
                          {u.name}{" "}
                        </p>{" "}
                        <p className="text-xs text-theme-muted">{u.email}</p>{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-6 py-4">
                      {" "}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : u.role === "manager"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-theme-card-hover text-theme-text "
                        }
 `}
                      >
                        {" "}
                        {u.role}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="px-6 py-4">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          {" "}
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(u.storageUsed / u.storageLimit) * 100}%`,
                            }}
                          />{" "}
                        </div>{" "}
                        <span className="text-xs text-theme-muted">
                          {" "}
                          {formatBytes(u.storageUsed)}{" "}
                        </span>{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-6 py-4 text-right">
                      {" "}
                      <span className="inline-flex items-center gap-1.5">
                        {" "}
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                        <span className="text-sm text-theme-muted ">
                          {" "}
                          Active{" "}
                        </span>{" "}
                      </span>{" "}
                    </td>{" "}
                  </tr>
                ))
              )}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

function User(props: any) {
  return <Users {...props} />;
}
