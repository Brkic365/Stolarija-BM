import { createSlice } from "@reduxjs/toolkit";

type FilterState = {
  categories: any[];
  priceRange: [number, number];
  sortType: string;
  minPrice: number;
  maxPrice: number;
  categoryCounts: [number, number, number];
};

export const filterSlice = createSlice({
  name: "filter",
  initialState: {
    categories: [],
    priceRange: [0, 0],
    sortType: "popular",
    minPrice: 0,
    maxPrice: 0,
    categoryCounts: [0, 0, 0],
  } as FilterState,
  reducers: {
    updateCategories: (state, { payload }) => {
      state.categories = payload;
    },
    updatePriceRange: (state, { payload }) => {
      state.priceRange = payload;
    },
    updateSortType: (state, { payload }) => {
      state.sortType = payload;
    },
    updateMinPrice: (state, { payload }) => {
      state.minPrice = payload;
    },
    updateMaxPrice: (state, { payload }) => {
      state.maxPrice = payload;
    },
    updateCategoryCounts: (state, { payload }) => {
      state.categoryCounts = payload;
    },
  },
});

export const {
  updateCategories,
  updatePriceRange,
  updateSortType,
  updateMinPrice,
  updateMaxPrice,
  updateCategoryCounts,
} = filterSlice.actions;
