"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/Products.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useSearchParams } from "next/navigation";

import Product from "@/components/Product";
import Link from "next/link";

import { ProductType } from "@/types/product";

import { HiAdjustmentsHorizontal } from "react-icons/hi2";

import { Select, SelectItem } from "@nextui-org/react";

import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Filters from "@/components/Filters";

type SortItemType = {
  label: string;
  value: string;
};

const sortItems: Array<SortItemType> = [
  {
    value: "popular",
    label: "Najprodavanije",
  },
  {
    value: "newest",
    label: "Najnovije",
  },
  {
    value: "priceDesc",
    label: "Cijena viša",
  },
  {
    value: "priceAsc",
    label: "Cijena niža",
  },
];

function Products() {
  const searchParams = useSearchParams();

  const supabase = createClientComponentClient();

  const [originalProducts, setOriginalProducts] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  const getProducts = async () => {
    const { data, error } = await supabase.from("Product").select("*");

    if (data) {
      // Get min and max price
      let min = data[0].price;
      let max = min;

      data.forEach((product) => {
        if (product.price < min) {
          min = product.price;
        }

        if (product.price > max) {
          max = product.price;
        }
      });

      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);

      setOriginalProducts(data);
      setProducts(data);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const categoryQuery = searchParams.get("category");

  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 0]);
  const [categories, setCategories] = useState<Array<string>>([]);
  const [sortType, setSortType] = useState("popular");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [length, setLength] = useState(0);

  const [categoryCounts, setCategoryCounts] = useState<number[]>([0, 0, 0]);

  // Toggle filters drawer
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpenFiltersDrawer(open);
    };

  const updateCategories = (value: any) => {
    setCategories(value);
  };

  const updatePriceRange = (value: any) => {
    setPriceRange(value);
  };

  const updateSortType = (e: any) => {
    setSortType(e.target.value);
  };

  // Filter by category and price
  useEffect(() => {
    // Filter based on price and category

    let kitchens = 0,
      rooms = 0,
      furniture = 0;

    let filteredProducts = originalProducts.filter((product) => {
      let priceInRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      // Update category counts before filtering categories
      if (priceInRange) {
        if (product.category === "kitchens") {
          kitchens++;
        } else if (product.category === "rooms") {
          rooms++;
        } else if (product.category === "furniture") {
          furniture++;
        }
      }

      return (
        priceInRange &&
        (categories.length === 0 || categories.includes(product.category))
      );
    });

    setCategoryCounts([kitchens, rooms, furniture]);

    setLength(filteredProducts.length);

    // Sort products
    if (sortType === "popular") {
      filteredProducts.sort((a, b) => {
        return b.price - a.price;
      });
    } else if (sortType === "newest") {
      filteredProducts.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (sortType === "priceAsc") {
      filteredProducts.sort((a, b) => {
        return a.price - b.price;
      });
    } else if (sortType === "priceDesc") {
      filteredProducts.sort((a, b) => {
        return b.price - a.price;
      });
    }

    setProducts(filteredProducts);
  }, [categories, priceRange, sortType]);

  // Set categories if there is a category query
  useEffect(() => {
    setCategories(categoryQuery ? [categoryQuery] : []);
  }, [categoryQuery]);

  return (
    <main className={styles.mainProducts}>
      <SwipeableDrawer
        anchor={"left"}
        open={openFiltersDrawer}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          style={{ marginTop: "-2rem" }}
        >
          <Filters
            includeSort
            categories={categories}
            updateCategories={updateCategories}
            priceRange={priceRange}
            updatePriceRange={updatePriceRange}
            sortType={sortType}
            updateSortType={updateSortType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categoryCounts={categoryCounts}
          />
        </Box>
      </SwipeableDrawer>

      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Top section */}
      <section className={styles.content}>
        <section className={styles.filtersContainer}>
          <Filters
            includeSort={false}
            categories={categories}
            updateCategories={updateCategories}
            priceRange={priceRange}
            updatePriceRange={updatePriceRange}
            sortType={sortType}
            updateSortType={updateSortType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categoryCounts={categoryCounts}
          />
        </section>
        <section className={styles.mainContent}>
          <section className={styles.top}>
            <div className={styles.text}>
              <h2>Proizvodi</h2>
              <p>
                <Link href="/web-shop">Web shop</Link>
                <span>/</span>Proizvodi
              </p>
            </div>

            <div className={styles.buttons}>
              <p className={styles.results}>
                {length > 0
                  ? `Prikazano 1-${length} od ${length} rezultata`
                  : "Nema rezultata"}
              </p>
              <button className={styles.filter} onClick={toggleDrawer(true)}>
                <HiAdjustmentsHorizontal />
                Filter
              </button>
              <div className={styles.sort}>
                <Select
                  items={sortItems}
                  onChange={updateSortType}
                  defaultSelectedKeys={["popular"]}
                  disallowEmptySelection
                  style={{
                    width: "12rem",
                    height: "2.3rem",
                    textAlign: "start",
                    alignItems: "flex-start",
                    marginRight: "0",
                    padding: "0 1rem",
                  }}
                  className="w-fit"
                >
                  {(sortItem: SortItemType) => (
                    <SelectItem key={sortItem.value}>
                      {sortItem.label}
                    </SelectItem>
                  )}
                </Select>
              </div>
            </div>
          </section>

          {/* Products section */}
          <section className={styles.products}>
            {products.map((product: ProductType, i: number) => {
              return (
                <div className={styles.productContainer} key={i}>
                  <Product product={product} />
                </div>
              );
            })}
          </section>
        </section>
      </section>
    </main>
  );
}

export default Products;
