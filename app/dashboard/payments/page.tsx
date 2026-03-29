"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  PencilSimpleIcon,
  CreditCardIcon,
  ReceiptIcon,
  UsersIcon,
  StackIcon,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const COLLECTORS = [
  "Juan Dela Cruz",
  "Maria Clara",
  "Joebert Joe",
  "Charlie Smith",
  "Bob Santos",
  "Alice Reyes",
  
];

const PAGE_SIZE = 10;

interface Payment {
  id: number;
  or_date: string;
  or_no_start: string;
  or_no_end: string;
  pieces: number;
  rcd_amount: number;
  collector: string;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  or_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })(),
  or_no_start: "",
  or_no_end: "",
  pieces: "",
  rcd_amount: "",
  collector: "",
};

type PaymentForm = typeof emptyForm;
type PaymentField = keyof PaymentForm;
type FormErrors = Partial<Record<PaymentField, string>>;
type DateRangeFilterValue = {
  start: string;
  end: string;
};

const dashboardCardClass =
  "rounded-3xl border border-border/60 bg-background/92 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.3)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/88";
const dashboardPanelClass =
  "rounded-3xl border border-border/60 bg-background/92 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/88";
const dashboardInputClass =
  "rounded-xl border-border/60 bg-background/75 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 hover:border-border focus-visible:border-ring/80 focus-visible:ring-[3px] focus-visible:ring-ring/15";
const dashboardReadOnlyInputClass =
  "rounded-xl border-border/50 bg-muted/55 shadow-sm";
const dashboardSelectTriggerClass =
  "rounded-xl border-border/60 bg-background/75 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 hover:border-border focus-visible:border-ring/80 focus-visible:ring-[3px] focus-visible:ring-ring/15";
const dashboardPrimaryButtonClass =
  "rounded-xl shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 hover:shadow-md";
const dashboardGhostButtonClass =
  "rounded-xl border border-transparent transition-[background-color,border-color,color] duration-200 hover:border-border/40 hover:bg-muted/60";
const dashboardIconButtonClass =
  "rounded-xl border border-transparent transition-[background-color,border-color,box-shadow] duration-200 hover:border-border/40 hover:bg-muted/60 hover:shadow-sm";
const dashboardDialogClass =
  "rounded-3xl border border-border/60 bg-background/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90";
const dashboardTableShellClass =
  "overflow-hidden rounded-3xl border border-border/60 bg-background/94 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90";

function sanitizeDigits(value: string, maxLength = 7) {
  return value.replace(/[^0-9]/g, "").slice(0, maxLength);
}

function toLocalDateString(value: string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [, setInsertError] = useState<string | null>(null);
  const [, setInsertFieldErrors] = useState<FormErrors>({});

  const [editRow, setEditRow] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [, setEditError] = useState<string | null>(null);
  const [, setEditFieldErrors] = useState<FormErrors>({});
  const [deleteRow, setDeleteRow] = useState<Payment | null>(null);

  const [passwordPromptRow, setPasswordPromptRow] = useState<Payment | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [editedIds, setEditedIds] = useState<Set<number>>(new Set());

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [, setDateRangeFilter] = useState<DateRangeFilterValue>({ start: "", end: "" });
  const [pendingDateRangeFilter, setPendingDateRangeFilter] = useState<DateRangeFilterValue>({ start: "", end: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const [lockedColumnWidths, setLockedColumnWidths] = useState<Partial<Record<string, string>>>({});

  useEffect(() => { fetchPayments(); }, []);

  useLayoutEffect(() => {
    if (payments.length === 0 || Object.keys(lockedColumnWidths).length > 0) return;

    let frame = 0;

    frame = requestAnimationFrame(() => {
      const tableElement = tableWrapperRef.current?.querySelector("table");
      if (!tableElement) return;

      const headerCells = tableElement.querySelectorAll<HTMLTableCellElement>("thead th[data-column-id]");
      const tableWidth = tableElement.getBoundingClientRect().width;

      if (!headerCells.length || tableWidth === 0) return;

      const nextWidths: Partial<Record<string, string>> = {};

      headerCells.forEach((cell) => {
        const columnId = cell.dataset.columnId;
        if (!columnId) return;

        nextWidths[columnId] = `${(cell.getBoundingClientRect().width / tableWidth) * 100}%`;
      });

      if (Object.keys(nextWidths).length > 0) {
        setLockedColumnWidths(nextWidths);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [lockedColumnWidths, payments.length]);

  useEffect(() => {
    if (editRow) {
      setEditForm({
        or_date: (() => { const d = new Date(editRow.or_date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })(),
        or_no_start: editRow.or_no_start,
        or_no_end: editRow.or_no_end,
        pieces: String(editRow.pieces),
        rcd_amount: String(editRow.rcd_amount),
        collector: editRow.collector,
      });
    }
  }, [editRow]);

  function computeEnd(start: string, pieces: string): string {
    const s = parseInt(start);
    const p = parseInt(pieces);
    if (isNaN(s) || isNaN(p) || p < 1) return "";
    return String(s + p - 1);
  }

  function validatePaymentForm(values: PaymentForm, ignoreId?: number): { summary: string | null; fieldErrors: FormErrors } {
    const fieldErrors: FormErrors = {};

    if (!values.or_date) fieldErrors.or_date = "Please choose an O.R. date.";
    if (!values.or_no_start) fieldErrors.or_no_start = "Enter an O.R. start number.";
    if (!values.pieces) fieldErrors.pieces = "Enter the number of pieces.";
    if (!values.rcd_amount) fieldErrors.rcd_amount = "Enter the RCD amount.";
    if (!values.collector) fieldErrors.collector = "Please select a collector.";

    if (values.or_no_start && !/^\d+$/.test(values.or_no_start)) {
      fieldErrors.or_no_start = "O.R. start number must contain digits only.";
    }

    if (values.or_no_end && !/^\d+$/.test(values.or_no_end)) {
      fieldErrors.or_no_end = "O.R. end number is invalid.";
    }

    if (values.pieces && (!/^\d+$/.test(values.pieces) || Number(values.pieces) < 1)) {
      fieldErrors.pieces = "Pieces must be a whole number greater than 0.";
    }

    if (values.rcd_amount && !/^\d+(\.\d{1,2})?$/.test(values.rcd_amount)) {
      fieldErrors.rcd_amount = "Use a valid amount with up to 2 decimal places.";
    }

    const start = Number(values.or_no_start);
    const end = Number(values.or_no_end);

    if (values.or_no_start && values.or_no_end && (Number.isNaN(start) || Number.isNaN(end) || start > end)) {
      fieldErrors.or_no_start = fieldErrors.or_no_start ?? "O.R. range is invalid.";
      fieldErrors.or_no_end = fieldErrors.or_no_end ?? "O.R. range is invalid.";
    }

    if (!fieldErrors.or_no_start && !fieldErrors.or_no_end && values.or_no_start && values.or_no_end) {
      const overlappingPayment = payments.find((payment) => {
        if (ignoreId && payment.id === ignoreId) return false;

        const existingStart = Number(payment.or_no_start);
        const existingEnd = Number(payment.or_no_end);
        if (Number.isNaN(existingStart) || Number.isNaN(existingEnd)) return false;

        return existingStart <= end && existingEnd >= start;
      });

      if (overlappingPayment) {
        const overlapMessage = `Overlaps with existing O.R. range ${overlappingPayment.or_no_start}-${overlappingPayment.or_no_end}.`;
        fieldErrors.or_no_start = overlapMessage;
        fieldErrors.or_no_end = overlapMessage;
      }
    }

    const summary = Object.values(fieldErrors)[0] ?? null;
    return { summary, fieldErrors };
  }

  async function fetchPayments() {
    const res = await fetch("/api/payments");
    if (res.ok) setPayments(await res.json());
  }

  async function handleInsert() {
    const validation = validatePaymentForm(form);
    if (validation.summary) {
      setInsertFieldErrors(validation.fieldErrors);
      setInsertError(validation.summary);
      toast.error(validation.summary);
      return;
    }
    setInsertFieldErrors({});
    setInsertError(null);
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pieces: Number(form.pieces), rcd_amount: Number(form.rcd_amount) }),
    });
    if (res.ok) {
      const created: Payment = await res.json();
      setPayments((prev) => [created, ...prev]);
      setForm(emptyForm);
      setInsertFieldErrors({});
      toast.success("Payment record inserted.");
      setNewIds((prev) => new Set(prev).add(created.id));
      setTimeout(() => {
        setNewIds((prev) => { const next = new Set(prev); next.delete(created.id); return next; });
      }, 4000);
    } else {
      const data = await res.json();
      const message = data.error ?? "Failed to insert record.";
      setInsertError(message);
      toast.error(message);
    }
    setLoading(false);
  }

  async function handleUpdate() {
    if (!editRow) return;
    const validation = validatePaymentForm(editForm, editRow.id);
    if (validation.summary) {
      setEditFieldErrors(validation.fieldErrors);
      setEditError(validation.summary);
      toast.error(validation.summary);
      return;
    }
    setEditFieldErrors({});
    setEditError(null);
    const res = await fetch(`/api/payments/${editRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, pieces: Number(editForm.pieces), rcd_amount: Number(editForm.rcd_amount) }),
    });
    if (res.ok) {
      const updated: Payment = await res.json();
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditRow(null);
      setEditFieldErrors({});
      toast.success("Payment record updated.");
      setEditedIds((prev) => new Set(prev).add(updated.id));
      setTimeout(() => {
        setEditedIds((prev) => { const next = new Set(prev); next.delete(updated.id); return next; });
      }, 4000);
    } else {
      const data = await res.json();
      const message = data.error ?? "Failed to update record.";
      setEditError(message);
      toast.error(message);
    }
  }

  function handlePasswordSubmit() {
    if (passwordInput === "password") {
      setEditRow(passwordPromptRow);
      setPasswordPromptRow(null);
      setPasswordInput("");
      setPasswordError(null);
    } else {
      setPasswordError("Incorrect password.");
    }
  }

  async function handleDelete() {
    if (!deleteRow) return;
    const res = await fetch(`/api/payments/${deleteRow.id}`, { method: "DELETE" });
    if (res.ok) {
      setPayments((prev) => prev.filter((p) => p.id !== deleteRow.id));
      toast.warning("Payment record deleted.");
      setDeleteRow(null);
    } else {
      toast.error("Failed to delete record.");
    }
  }

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "or_date",
        header: "O.R. Date",
        filterFn: (row, columnId, filterValue: DateRangeFilterValue) => {
          const local = toLocalDateString(String(row.getValue(columnId)));
          if (filterValue?.start && local < filterValue.start) return false;
          if (filterValue?.end && local > filterValue.end) return false;
          return true;
        },
        cell: ({ getValue }) =>
          format(new Date(String(getValue())), "MM/dd/yyyy"),
      },
      { accessorKey: "or_no_start", header: "O.R. No. Start", filterFn: (row, columnId, filterValue) => String(row.getValue(columnId)).startsWith(String(filterValue)) },
      { accessorKey: "or_no_end", header: "O.R. No. End", filterFn: (row, columnId, filterValue) => String(row.getValue(columnId)).startsWith(String(filterValue)) },
      { accessorKey: "pieces", header: "Pieces", filterFn: "includesString" },
      {
        accessorKey: "rcd_amount",
        header: "RCD Amount",
        cell: ({ getValue }) =>
          Number(getValue()).toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
      },
      {
        accessorKey: "collector",
        header: "Collector",
        filterFn: "equals",
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="icon-sm" variant="ghost" onClick={() => {
              setPasswordPromptRow(row.original);
              setPasswordInput("");
              setPasswordError(null);
            }} className={dashboardIconButtonClass}>
              <PencilSimpleIcon />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    state: { columnFilters, pagination },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const FILTER_COLUMNS = [
    { id: "collector",   label: "Collector",      type: "select" },
    { id: "or_date",     label: "O.R. Date",      type: "date"   },
    { id: "or_no_start", label: "O.R. No. Start", type: "text"   },
    { id: "or_no_end",   label: "O.R. No. End",   type: "text"   },
  ];

  function applyFilter(col: string, val: string | DateRangeFilterValue) {
    if (col === "or_date" && typeof val !== "string") {
      setDateRangeFilter(val);
      const hasDateRange = Boolean(val.start || val.end);
      setColumnFilters(
        hasDateRange
          ? [...columnFilters.filter((f) => f.id !== col), { id: col, value: val }]
          : columnFilters.filter((f) => f.id !== col)
      );
      return;
    }

    if (typeof val !== "string") return;

    setFilterValue(val);
    setColumnFilters(
      val === "" || val === "all"
        ? columnFilters.filter((f) => f.id !== col)
        : [...columnFilters.filter((f) => f.id !== col), { id: col, value: val }]
    );
  }

  function handleFilterColumnChange(col: string) {
    setFilterColumn(col);
    setFilterValue("");
    setDateRangeFilter({ start: "", end: "" });
    setPendingDateRangeFilter({ start: "", end: "" });
    setColumnFilters(columnFilters.filter((f) => f.id !== filterColumn));
  }

  function handleDateRangeSearch() {
    applyFilter("or_date", pendingDateRangeFilter);
  }

  return (
    <SidebarInset>
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
        <span className="text-xs font-medium text-muted-foreground">Payments</span>
      </header>

      <div className="flex flex-col gap-4 p-4 pb-4">

        {/* Stats */}
        {(() => {
          const totalRCD = payments.reduce((sum, p) => sum + Number(p.rcd_amount), 0);
          const totalPieces = payments.reduce((sum, p) => sum + Number(p.pieces), 0);
          const uniqueCollectors = new Set(payments.map((p) => p.collector)).size;
          const isFiltered = columnFilters.length > 0;
          const filteredRows = table.getFilteredRowModel().rows;
          const filteredRCD = filteredRows.reduce((sum, r) => sum + Number(r.original.rcd_amount), 0);

          const stats = [
            {
              label: "Total RCD Amount",
              value: totalRCD.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
              description: `${payments.length} record${payments.length !== 1 ? "s" : ""} total`,
              icon: CreditCardIcon,
            },
            {
              label: "Total Pieces",
              value: totalPieces.toLocaleString(),
              description: "Total O.R. pieces issued",
              icon: StackIcon,
            },
            {
              label: "Filtered RCD Amount",
              value: isFiltered
                ? filteredRCD.toLocaleString("en-PH", { style: "currency", currency: "PHP" })
                : "—",
              description: isFiltered
                ? `${filteredRows.length} filtered record${filteredRows.length !== 1 ? "s" : ""}`
                : "Apply a filter to see total",
              icon: ReceiptIcon,
            },
            {
              label: "Active Collectors",
              value: String(uniqueCollectors),
              description: "Collectors with records",
              icon: UsersIcon,
            },
          ];

          return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className={dashboardCardClass}>
                  <CardHeader className="gap-3 px-5 pt-5 pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardDescription className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
                        {stat.label}
                      </CardDescription>
                      <div className="flex size-9 items-center justify-center rounded-2xl border border-border/50 bg-background/75 shadow-sm">
                        <stat.icon className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <p className="text-xs leading-relaxed text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}

        {/* Insert Form Bar */}
        <div className={`flex flex-wrap items-end gap-3 ${dashboardPanelClass}`}>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">O.R. No. - Start</Label>
            <Input type="text" inputMode="numeric" className={`w-28 ${dashboardInputClass}`} value={form.or_no_start}
              maxLength={7}
              onChange={(e) => {
                const start = sanitizeDigits(e.target.value);
                setInsertError(null);
                setForm((f) => ({ ...f, or_no_start: start, or_no_end: computeEnd(start, f.pieces) }));
              }} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">O.R. No. - End</Label>
            <Input type="number" className={`w-28 ${dashboardReadOnlyInputClass}`} value={form.or_no_end} readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">No. of Pieces</Label>
            <Input type="number" min="1" className={`w-24 ${dashboardInputClass}`} value={form.pieces}
              onChange={(e) => {
                const pieces = e.target.value;
                setForm((f) => ({ ...f, pieces, or_no_end: computeEnd(f.or_no_start, pieces) }));
              }} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">RCD Amount</Label>
            <Input type="text" inputMode="decimal" className={`w-32 ${dashboardInputClass}`} value={form.rcd_amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d{0,2}).*/g, "$1");
                setForm((f) => ({ ...f, rcd_amount: val }));
              }} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">Collector</Label>
            <Select value={form.collector} onValueChange={(v) => setForm((f) => ({ ...f, collector: v }))}>
              <SelectTrigger className={`w-44 ${dashboardSelectTriggerClass}`}><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {COLLECTORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInsert} className={dashboardPrimaryButtonClass} disabled={loading}>
            {loading ? "Inserting…" : "INSERT"}
          </Button>
        </div>

        {/* Filter Row */}
        <div className={`flex flex-wrap items-end gap-3 ${dashboardPanelClass}`}>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-foreground/90">Filter by</Label>
            <Select value={filterColumn} onValueChange={handleFilterColumnChange}>
              <SelectTrigger className={`w-44 ${dashboardSelectTriggerClass}`}>
                <SelectValue placeholder="Select column…" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_COLUMNS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filterColumn && (() => {
            const col = FILTER_COLUMNS.find((c) => c.id === filterColumn)!;
            if (col.id === "or_date") {
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-foreground/90">Start Date</Label>
                    <Input
                      type="date"
                      className={`w-44 ${dashboardInputClass}`}
                      value={pendingDateRangeFilter.start}
                      onChange={(e) =>
                        setPendingDateRangeFilter((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-foreground/90">End Date</Label>
                    <Input
                      type="date"
                      className={`w-44 ${dashboardInputClass}`}
                      value={pendingDateRangeFilter.end}
                      onChange={(e) =>
                        setPendingDateRangeFilter((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className={`self-end ${dashboardPrimaryButtonClass}`}
                    onClick={handleDateRangeSearch}
                  >
                    Search
                  </Button>
                </>
              );
            }
            if (col.type === "select") {
              return (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-foreground/90">{col.label}</Label>
                  <Select value={filterValue || "all"} onValueChange={(v) => applyFilter(filterColumn, v)}>
                    <SelectTrigger className={`w-44 ${dashboardSelectTriggerClass}`}>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {COLLECTORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            return (
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-foreground/90">{col.label}</Label>
                <Input
                  type={col.id === "or_no_start" || col.id === "or_no_end" ? "text" : col.type}
                  inputMode={col.id === "or_no_start" || col.id === "or_no_end" ? "numeric" : undefined}
                  maxLength={col.id === "or_no_start" || col.id === "or_no_end" ? 7 : undefined}
                  className={`w-44 ${dashboardInputClass}`}
                  value={filterValue}
                  placeholder={`Search ${col.label}…`}
                  onChange={(e) =>
                    applyFilter(
                      filterColumn,
                      col.id === "or_no_start" || col.id === "or_no_end"
                        ? sanitizeDigits(e.target.value)
                        : e.target.value
                    )
                  }
                />
              </div>
            );
          })()}

          {filterColumn && (
            <Button variant="ghost" size="sm" className={dashboardGhostButtonClass} onClick={() => {
              setFilterColumn("");
              setFilterValue("");
              setDateRangeFilter({ start: "", end: "" });
              setPendingDateRangeFilter({ start: "", end: "" });
              setColumnFilters([]);
            }}>
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div ref={tableWrapperRef} className={dashboardTableShellClass}>
          <Table className={Object.keys(lockedColumnWidths).length > 0 ? "table-fixed text-sm" : "text-sm"}>
            {Object.keys(lockedColumnWidths).length > 0 ? (
              <colgroup>
                {table.getVisibleLeafColumns().map((column) => (
                  <col key={column.id} style={{ width: lockedColumnWidths[column.id] }} />
                ))}
              </colgroup>
            ) : null}
            <TableHeader className="bg-muted/20 [&_tr]:border-b-border/60">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} data-column-id={header.column.id} className="h-11 px-4 text-[13px] font-semibold text-foreground/80">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className={newIds.has(row.original.id) ? "bg-green-500/10 transition-colors duration-1000 hover:bg-green-500/10" : editedIds.has(row.original.id) ? "bg-blue-500/10 transition-colors duration-1000 hover:bg-blue-500/10" : "transition-colors duration-200 hover:bg-muted/35"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-2 pb-2">
          <p className="rounded-full border border-border/50 bg-background/85 px-3 py-1 text-center text-xs text-muted-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} &mdash;{" "}
            {table.getFilteredRowModel().rows.length} record{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          </p>
          <div className="rounded-full border border-border/60 bg-background/95 px-2 py-1.5 shadow-[0_18px_38px_-24px_rgba(15,23,42,0.3)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90">
            <Pagination className="w-auto justify-center">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); table.previousPage(); }}
                    aria-disabled={!table.getCanPreviousPage()}
                    className={`rounded-full ${!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); table.nextPage(); }}
                    aria-disabled={!table.getCanNextPage()}
                    className={`rounded-full ${!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Password Prompt */}
      <Dialog open={!!passwordPromptRow} onOpenChange={(o) => { if (!o) { setPasswordPromptRow(null); setPasswordInput(""); setPasswordError(null); } }}>
        <DialogContent className={`sm:max-w-sm ${dashboardDialogClass}`}>
          <DialogHeader className="gap-1.5"><DialogTitle className="text-base font-semibold tracking-tight">Authentication Required</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-foreground/90">Password</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                placeholder="Enter password…"
                className={dashboardInputClass}
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-xs leading-relaxed text-destructive">
                {passwordError}
              </p>
            )}
          </div>
          <DialogFooter className="mt-1 gap-2">
            <Button variant="ghost" className={dashboardGhostButtonClass} onClick={() => { setPasswordPromptRow(null); setPasswordInput(""); setPasswordError(null); }}>Cancel</Button>
            <Button className={dashboardPrimaryButtonClass} onClick={handlePasswordSubmit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className={`sm:max-w-md ${dashboardDialogClass}`}>
          <DialogHeader className="gap-1.5"><DialogTitle className="text-base font-semibold tracking-tight">Edit Payment</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-foreground/90">O.R. Date</Label>
              <Input type="date" className={dashboardInputClass} value={editForm.or_date}
                onChange={(e) => setEditForm((f) => ({ ...f, or_date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-foreground/90">O.R. No. - Start</Label>
                <Input type="text" inputMode="numeric" maxLength={7} className={dashboardInputClass} value={editForm.or_no_start}
                  onChange={(e) => {
                    const start = sanitizeDigits(e.target.value);
                    setEditError(null);
                    setEditForm((f) => ({ ...f, or_no_start: start, or_no_end: computeEnd(start, f.pieces) }));
                  }} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-foreground/90">O.R. No. - End</Label>
                <Input type="number" className={dashboardReadOnlyInputClass} value={editForm.or_no_end} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-foreground/90">No. of Pieces</Label>
                <Input type="number" min="1" className={dashboardInputClass} value={editForm.pieces}
                  onChange={(e) => {
                    const pieces = e.target.value;
                    setEditForm((f) => ({ ...f, pieces, or_no_end: computeEnd(f.or_no_start, pieces) }));
                  }} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-foreground/90">RCD Amount</Label>
                <Input type="text" inputMode="decimal" className={dashboardInputClass} value={editForm.rcd_amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d{0,2}).*/g, "$1");
                    setEditForm((f) => ({ ...f, rcd_amount: val }));
                  }} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-foreground/90">Collector</Label>
              <Select value={editForm.collector} onValueChange={(v) => setEditForm((f) => ({ ...f, collector: v }))}>
                <SelectTrigger className={`w-full ${dashboardSelectTriggerClass}`}><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {COLLECTORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-1 gap-2 sm:items-center">
            <Button variant="destructive" className={`mr-auto ${dashboardPrimaryButtonClass}`} onClick={() => { setDeleteRow(editRow); setEditRow(null); }}>Delete</Button>
            <Button variant="ghost" className={dashboardGhostButtonClass} onClick={() => setEditRow(null)}>Cancel</Button>
            <Button className={dashboardPrimaryButtonClass} onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent size="sm" className={dashboardDialogClass}>
          <AlertDialogHeader className="gap-1.5">
            <AlertDialogTitle className="text-base font-semibold tracking-tight">Delete this record?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              This will permanently remove the payment entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-1 gap-2">
            <AlertDialogCancel className={dashboardGhostButtonClass}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" className={dashboardPrimaryButtonClass} onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
