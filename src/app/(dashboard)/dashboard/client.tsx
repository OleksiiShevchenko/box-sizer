"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/ui/unit-toggle";
import { ProductForm } from "@/components/calculator/product-form";
import { ProductList } from "@/components/calculator/product-list";
import { ResultDisplay } from "@/components/calculator/result-display";
import { calculatePackingAction } from "@/actions/calculator-actions";
import type { IProduct, PackingResult, UnitSystem } from "@/types";
import Link from "next/link";

export function DashboardClient({ hasBoxes }: { hasBoxes: boolean }) {
  const [unit, setUnit] = useState<UnitSystem>("cm");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [results, setResults] = useState<PackingResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addProduct(product: IProduct) {
    setProducts((prev) => [...prev, product]);
    setResults(null);
  }

  function removeProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  }

  async function handleCalculate() {
    if (products.length === 0) return;
    setError("");
    setLoading(true);
    setResults(null);

    const result = await calculatePackingAction(products);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.results) {
      setResults(result.results);
    }
  }

  if (!hasBoxes) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Card className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">
            You should add packaging options first.
          </p>
          <Link
            href="/settings/packaging"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Boxes
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Add Products to Pack</h2>
        <ProductForm unit={unit} onAdd={addProduct} />
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">
          Products ({products.length})
        </h2>
        <ProductList products={products} unit={unit} onRemove={removeProduct} />
      </div>

      {products.length > 0 && (
        <div className="flex gap-3">
          <Button onClick={handleCalculate} disabled={loading} size="lg">
            {loading ? "Calculating..." : "Calculate Best Box"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setProducts([]);
              setResults(null);
              setError("");
            }}
          >
            Clear All
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {results && <ResultDisplay results={results} unit={unit} />}
    </div>
  );
}
