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
import { ProductForm } from "./product-form";
import { Eye, Edit, Package, Boxes, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  code: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: string | null;
  cost: string | null;
  buyPrice: string;
  sellPrice: string | null;
  currentStock: number;
  minStock: number;
  description: string | null;
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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(0);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = () => setModalMode("edit");

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const columns: Column<Product>[] = [
    {
      key: "no",
      header: "No",
      width: "60px",
      render: (_, index) => (
        <span className="text-sm text-gray-500">{page * pageSize + index + 1}</span>
      ),
    },
    {
      key: "code",
      header: "Code",
      width: "100px",
      sortable: true,
      render: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
      key: "name",
      header: "Product",
      sortable: true,
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
      key: "currentStock",
      header: "Stock",
      width: "100px",
      sortable: true,
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
      sortable: true,
      render: (row) => formatCurrency(Number(row.buyPrice)),
    },
    {
      key: "sellPrice",
      header: "Sell Price",
      width: "120px",
      sortable: true,
      render: (row) =>
        row.sellPrice ? formatCurrency(Number(row.sellPrice)) : "-",
    },
    {
      key: "isActive",
      header: "Status",
      width: "90px",
      sortable: true,
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
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedProduct(row);
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
        onAdd={handleCreate}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSortChange}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No products found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Add Product"
            : modalMode === "edit"
              ? "Edit Product"
              : "Product Details"
        }
        size="md"
      >
        <ProductForm
          mode={modalMode}
          product={selectedProduct}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={modalMode === "view" ? handleEdit : undefined}
        />
      </SidebarModal>
    </div>
  );
}
