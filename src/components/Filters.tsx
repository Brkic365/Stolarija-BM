"use client";

import React, { useRef, useEffect } from "react";
import styles from "@/styles/components/Filters.module.scss";

import { useDispatch, useSelector } from "react-redux";
import {
  updateCategories,
  updateSortType,
  updatePriceRange,
} from "@/redux/slices/filterSlice";

import {
  Select,
  SelectItem,
  CheckboxGroup,
  Checkbox,
  Slider,
} from "@nextui-org/react";

type SortItemType = {
  label: string;
  value: string;
};

type PropType = {
  includeSort: boolean;
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
    value: "priceAsc",
    label: "Cijena viša",
  },
  {
    value: "priceDesc",
    label: "Cijena niža",
  },
];

function Filters({ includeSort }: PropType) {
  const dispatch = useDispatch();
  const filter = useSelector((state: any) => state.filter);

  const sliderRef = useRef<any>(null);

  const handleSortTypeUpdate = (e: any) => {
    dispatch(updateSortType(e.target.value));
  };

  const handleCategoriesUpdate = (value: any) => {
    dispatch(updateCategories(value));
  };

  const handlePriceRangeUpdate = (value: any) => {
    dispatch(updatePriceRange(value));
  };

  if (filter.maxPrice === 0) return null;

  return (
    <section className={styles.filters}>
      {includeSort && (
        <div className={styles.sort}>
          <h2>Sortiraj</h2>
          <Select
            items={sortItems}
            defaultSelectedKeys={["popular"]}
            onChange={handleSortTypeUpdate}
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
              <SelectItem key={sortItem.value}>{sortItem.label}</SelectItem>
            )}
          </Select>
        </div>
      )}
      <h2>Kategorija</h2>
      <CheckboxGroup
        onChange={handleCategoriesUpdate}
        value={filter.categories}
      >
        <Checkbox value="kitchens" style={{ marginBottom: "0.5rem" }}>
          <div className={styles.checkbox}>
            Kuhinje{" "}
            <div className={styles.amount}>{filter.categoryCounts[0]}</div>
          </div>
        </Checkbox>
        <Checkbox value="rooms" style={{ marginBottom: "0.5rem" }}>
          <div className={styles.checkbox}>
            Dječje Sobe{" "}
            <div className={styles.amount}>{filter.categoryCounts[1]}</div>
          </div>
        </Checkbox>
        <Checkbox value="furniture" style={{ marginBottom: "0.5rem" }}>
          {" "}
          <div className={styles.checkbox}>
            Namještaj{" "}
            <div className={styles.amount}>{filter.categoryCounts[2]}</div>
          </div>
        </Checkbox>
        <Checkbox value="closets">
          {" "}
          <div className={styles.checkbox}>
            Ormari{" "}
            <div className={styles.amount}>{filter.categoryCounts[3]}</div>
          </div>
        </Checkbox>
      </CheckboxGroup>
      <h2>Cijena</h2>
      <Slider
        size="sm"
        step={1}
        minValue={filter.minPrice}
        maxValue={filter.maxPrice}
        defaultValue={filter.priceRange}
        label=" "
        formatOptions={{ style: "currency", currency: "EUR" }}
        className="max-w-md"
        onChangeEnd={handlePriceRangeUpdate}
        ref={sliderRef}
      />
    </section>
  );
}

export default Filters;
