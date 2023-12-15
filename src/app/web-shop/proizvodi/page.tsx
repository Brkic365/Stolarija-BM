"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/Products.module.scss";
import rawProductSections from "../../../../public/data/products.json";

import { useSearchParams } from "next/navigation";

import Product from "@/components/Product";
import Link from "next/link";

import { HiAdjustmentsHorizontal } from "react-icons/hi2";

import { Select, SelectItem } from "@nextui-org/react";

import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Filters from "@/components/Filters";

type ProductType = {
  category: string;
  name: string;
  price: number;
  image: string;
  uploadDate: string;
};

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

  const categoryQuery = searchParams.get("category");

  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);

  const [products, setProducts] = useState<ProductType[]>([]);
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
    // Filter by price
    let filteredPrice = rawProductSections.map((productSection) => {
      return {
        ...productSection,
        products: productSection.products.filter((product) => {
          return (
            product.price >= priceRange[0] && product.price <= priceRange[1]
          );
        }),
      };
    });

    // Create a copy of filteredPrice to store the amount of categories available for current price filter
    let filteredCategories = filteredPrice;

    // Get amount of categories available for current price filter
    filteredCategories.forEach((productSection, i) => {
      setCategoryCounts((prev) => {
        prev[i] = productSection.products.length;
        return prev;
      });
    });

    // Filter by category if there are any selected
    if (categories.length > 0) {
      filteredCategories = filteredPrice.filter((productSection) => {
        return categories.includes(productSection.id);
      });
    }

    let lengthTemp = 0;

    // Get length of products
    filteredCategories.forEach((productSection) => {
      lengthTemp += productSection.products.length;
    });

    setLength(lengthTemp);

    // Flat the products into one array
    const flatProductsArray = filteredCategories.flatMap((val) =>
      val.products.map((product) => ({
        ...product,
        category: val.id,
      }))
    );

    // Sort products
    if (sortType === "popular") {
      flatProductsArray.sort((a, b) => {
        return b.price - a.price;
      });
    } else if (sortType === "newest") {
      flatProductsArray.sort((a, b) => {
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      });
    } else if (sortType === "priceAsc") {
      flatProductsArray.sort((a, b) => {
        return a.price - b.price;
      });
    } else if (sortType === "priceDesc") {
      flatProductsArray.sort((a, b) => {
        return b.price - a.price;
      });
    }

    setProducts(flatProductsArray);
  }, [categories, priceRange, sortType]);

  // Get min and max price
  useEffect(() => {
    let min = rawProductSections[0].products[0].price;
    let max = min;

    rawProductSections.forEach((productSection) => {
      productSection.products.forEach((product) => {
        if (product.price < min) {
          min = product.price;
        }

        if (product.price > max) {
          max = product.price;
        }
      });
    });

    setMinPrice(min);
    setMaxPrice(max);
    setPriceRange([min, max]);
  }, [rawProductSections]);

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
