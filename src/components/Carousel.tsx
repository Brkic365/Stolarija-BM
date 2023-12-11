"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel, {
  EmblaCarouselType,
  EmblaOptionsType,
} from "embla-carousel-react";

import styles from "@/styles/components/Carousel.module.scss";

import { HiArrowNarrowRight, HiArrowNarrowLeft } from "react-icons/hi";

import Product from "@/components/Product";

type ProductType = {
  name: string;
  price: number;
  image: string;
};

type PropType = {
  products: ProductType[];
  options?: EmblaOptionsType;
};

const Carousel = (props: PropType) => {
  const { products, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {products.map((product, i) => (
            <div className={styles.slide} key={i}>
              <Product product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttons}>
        <button onClick={scrollPrev} disabled={prevBtnDisabled}>
          <HiArrowNarrowLeft />
        </button>
        <button onClick={scrollNext} disabled={nextBtnDisabled}>
          <HiArrowNarrowRight />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
