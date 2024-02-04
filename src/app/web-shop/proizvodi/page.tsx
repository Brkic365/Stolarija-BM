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

import { useDispatch, useSelector } from "react-redux";
import {
  updateCategories,
  updateCategoryCounts,
  updateMaxPrice,
  updateMinPrice,
  updateSortType,
  updatePriceRange,
} from "@/redux/slices/filterSlice";

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
  const dispatch = useDispatch();
  const filter = useSelector((state: any) => state.filter);

  const searchParams = useSearchParams();

  const supabase = createClientComponentClient();

  const [originalProducts, setOriginalProducts] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  const getProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");

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

      dispatch(updateMinPrice(min));
      dispatch(updateMaxPrice(max));
      dispatch(updatePriceRange([min, max]));

      setOriginalProducts(data);
      setProducts(data);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const categoryQuery = searchParams.get("category");

  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);

  const [length, setLength] = useState(0);

  const handleSortTypeUpdate = (e: any) => {
    dispatch(updateSortType(e.target.value));
  };

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

  // Filter by category and price
  useEffect(() => {
    // Filter based on price and category

    let kitchens = 0,
      rooms = 0,
      furniture = 0,
      closets = 0;

    let filteredProducts = originalProducts.filter((product) => {
      let priceInRange =
        product.price >= filter.priceRange[0] &&
        product.price <= filter.priceRange[1];

      // Update category counts before filtering categories
      if (priceInRange) {
        if (product.category === "kitchens") {
          kitchens++;
        } else if (product.category === "rooms") {
          rooms++;
        } else if (product.category === "furniture") {
          furniture++;
        } else if (product.category === "closets") {
          closets++;
        }
      }

      return (
        priceInRange &&
        (filter.categories.length === 0 ||
          filter.categories.includes(product.category))
      );
    });

    dispatch(updateCategoryCounts([kitchens, rooms, furniture, closets]));

    setLength(filteredProducts.length);

    // Sort products
    if (filter.sortType === "popular") {
      filteredProducts.sort((a, b) => {
        return b.orders - a.orders;
      });
    } else if (filter.sortType === "newest") {
      filteredProducts.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (filter.sortType === "priceAsc") {
      filteredProducts.sort((a, b) => {
        return a.price - b.price;
      });
    } else if (filter.sortType === "priceDesc") {
      filteredProducts.sort((a, b) => {
        return b.price - a.price;
      });
    }

    setProducts(filteredProducts);
  }, [filter.categories, filter.priceRange, filter.sortType]);

  // Set categories if there is a category query
  useEffect(() => {
    dispatch(updateCategories(categoryQuery ? [categoryQuery] : []));
  }, [filter.categoryQuery]);

  useEffect(() => {}, [filter]);

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
          <Filters includeSort />
        </Box>
      </SwipeableDrawer>

      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Top section */}
      <section className={styles.content}>
        <section className={styles.filtersContainer}>
          <Filters includeSort={false} />
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
                  onChange={handleSortTypeUpdate}
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
