import React from "react";
import styles from "@/styles/components/Filters.module.scss";

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
  categories: Array<string>;
  updateCategories: (value: any) => void;
  priceRange: Array<number>;
  updatePriceRange: (value: any) => void;
  sortType: string;
  updateSortType: (value: any) => void;
  minPrice: number;
  maxPrice: number;
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

function Filters({
  includeSort,
  categories,
  updateCategories,
  priceRange,
  updatePriceRange,
  sortType,
  updateSortType,
  minPrice,
  maxPrice,
}: PropType) {
  if (maxPrice === 0) return null;

  return (
    <section className={styles.filters}>
      {includeSort && (
        <div className={styles.sort}>
          <h2>Sortiraj</h2>
          <Select
            items={sortItems}
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
              <SelectItem key={sortItem.value}>{sortItem.label}</SelectItem>
            )}
          </Select>
        </div>
      )}
      <h2>Kategorija</h2>
      <CheckboxGroup onChange={updateCategories} value={categories}>
        <Checkbox value="kitchens" style={{ marginBottom: "0.5rem" }}>
          <div className={styles.checkbox}>
            Kuhinje <div className={styles.amount}>10</div>
          </div>
        </Checkbox>
        <Checkbox value="rooms" style={{ marginBottom: "0.5rem" }}>
          <div className={styles.checkbox}>
            Dječje Sobe <div className={styles.amount}>12</div>
          </div>
        </Checkbox>
        <Checkbox value="furniture">
          {" "}
          <div className={styles.checkbox}>
            Namještaj <div className={styles.amount}>5</div>
          </div>
        </Checkbox>
      </CheckboxGroup>
      <h2>Cijena</h2>
      <Slider
        size="sm"
        step={1}
        minValue={minPrice}
        maxValue={maxPrice}
        defaultValue={[minPrice, maxPrice]}
        value={priceRange}
        label=" "
        formatOptions={{ style: "currency", currency: "EUR" }}
        className="max-w-md"
        onChange={updatePriceRange}
      />
    </section>
  );
}

export default Filters;
