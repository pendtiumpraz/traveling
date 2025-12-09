"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  Card,
  SidebarModal,
} from "@/components/ui";
import { EmployeeForm } from "./employee-form";
import { Eye, Edit, Users, UserCheck, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string | null;
  position: string;
  department: string;
  phone: string | null;
  joinDate: string;
  status: string;
  isTourLeader: boolean;
  baseSalary: string | null;
  branch: { name: string } | null;
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  RESIGNED: "warning",
  TERMINATED: "destructive",
};

export default function HRISPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/employees?page=${page}&pageSize=${pageSize}&search=${search}`,
      );
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;
  const tourLeaders = employees.filter((e) => e.isTourLeader).length;

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = () => setModalMode("edit");

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const columns: Column<Employee>[] = [
    {
      key: "nip",
      header: "NIP",
      width: "100px",
      render: (row) => <span className="font-mono text-xs">{row.nip}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.isTourLeader && (
            <Badge variant="default" size="sm">
              Tour Leader
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (row) => (
        <div>
          <p className="text-sm">{row.position}</p>
          <p className="text-xs text-gray-500">{row.department}</p>
        </div>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      width: "120px",
      render: (row) => row.branch?.name || "-",
    },
    {
      key: "joinDate",
      header: "Join Date",
      width: "110px",
      render: (row) =>
        formatDate(row.joinDate, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedEmployee(row);
              setModalMode("edit");
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HRIS</h1>
        <p className="text-gray-500">Human Resource Information System</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Total Employees</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tourLeaders}</p>
              <p className="text-sm text-gray-500">Tour Leaders</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">Attendance</Button>
        <Button variant="outline">Leave</Button>
        <Button variant="outline">Payroll</Button>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchPlaceholder="Search employees..."
        onSearch={setSearch}
        addLabel="Add Employee"
        onAdd={handleCreate}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No employees found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Add Employee"
            : modalMode === "edit"
              ? "Edit Employee"
              : "Employee Details"
        }
        size="md"
      >
        <EmployeeForm
          mode={modalMode}
          employee={selectedEmployee}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={modalMode === "view" ? handleEdit : undefined}
        />
      </SidebarModal>
    </div>
  );
}
