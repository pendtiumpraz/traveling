"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Edit, Package, Boxes, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: string;
  sellPrice: string | null;
  minStock: number;
  isActive: boolean;
  stocks: { quantity: number; warehouse: { name: string } }[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products?page=${page}&pageSize=${pageSize}&search=${search}`,
      );
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalStock = products.reduce(
    (sum, p) => sum + p.stocks.reduce((s, st) => s + st.quantity, 0),
    0,
  );
  const lowStock = products.filter((p) => {
    const qty = p.stocks.reduce((s, st) => s + st.quantity, 0);
    return qty < p.minStock;
  }).length;

  const columns: Column<Product>[] = [
    {
      key: "code",
      header: "Code",
      width: "100px",
      render: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      width: "80px",
    },
    {
      key: "stock",
      header: "Stock",
      width: "100px",
      render: (row) => {
        const qty = row.stocks.reduce((s, st) => s + st.quantity, 0);
        const isLow = qty < row.minStock;
        return (
          <div className="flex items-center gap-1">
            <span className={isLow ? "text-red-600 font-medium" : ""}>
              {qty}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      key: "buyPrice",
      header: "Buy Price",
      width: "120px",
      render: (row) => formatCurrency(Number(row.buyPrice)),
    },
    {
      key: "sellPrice",
      header: "Sell Price",
      width: "120px",
      render: (row) =>
        row.sellPrice ? formatCurrency(Number(row.sellPrice)) : "-",
    },
    {
      key: "status",
      header: "Status",
      width: "90px",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500">Manage products and stock</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Products</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Boxes className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock}</p>
              <p className="text-sm text-gray-500">Total Stock</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStock}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchPlaceholder="Search products..."
        onSearch={setSearch}
        addLabel="Add Product"
        onAdd={() => {}}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No products found"
      />
    </div>
  );
}
