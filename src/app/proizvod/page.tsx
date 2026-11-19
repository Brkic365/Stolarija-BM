"use client";

import React, { useState, useEffect, Suspense } from "react";
import styles from "@/styles/pages/ProductPage.module.scss";

import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { HiArrowSmRight, HiCheck } from "react-icons/hi";

import PurchaseModal from "@/components/modals/PurchaseModal";
import ProductImagesCarousel from "@/components/ProductImagesCarousel";
import StatusMessage from "@/components/StatusMessage";
import { formatPrice } from "@/lib/format";

import dynamic from "next/dynamic";
const KitchenScene = dynamic(() => import("@/components/KitchenScene"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "#f5f5f5", borderRadius: "1rem" }} />
});

import { motion } from "framer-motion";

import { EmblaOptionsType } from "embla-carousel-react";

import { CircularProgress } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setOption, resetConfiguration } from "@/redux/slices/configurationSlice";
import clsx from "clsx";
import { ProductOption, OptionChoice } from "@/types/product";

const OPTIONS: EmblaOptionsType = {};

// Removed hardcoded COLOR_MAP in favor of dynamic DB options

function ProductPageLoading() {
  return (
    <main className={styles.mainProductLoading}>
      {/* Hero section */}
      <section className={styles.hero} />

      <div className={styles.loading}>
        <CircularProgress aria-label="Loading..." size="lg" color="default" />
      </div>
    </main>
  );
}

function ProductPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const idQuery = searchParams.get("id");

  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("specifikacije");
  const [product, setProduct] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const dispatch = useDispatch();
  const configuration = useSelector((state: RootState) => state.configuration.selectedOptions);

  useEffect(() => {
    dispatch(resetConfiguration());
  }, [idQuery, dispatch]);

  const areAllOptionsSelected = product?.options?.every((opt: any) => configuration[opt.name]);

  const getProduct = async () => {
    if (!idQuery) {
      setStatus("notFound");
      return;
    }

    setStatus("loading");
    const { data, error } = await supabase
      .from("products")
      .select()
      .eq("id", idQuery);

    if (error) {
      console.error("Failed to load product:", error.message);
      setStatus("error");
      return;
    }

    if (!data || data.length === 0) {
      setStatus("notFound");
      return;
    }

    setProduct(data[0]);
    setStatus("ready");

    setImageUrls(
      (data[0].images ?? []).map((image: { url: string }) => image.url)
    );

    // Set Default Options
    if (data[0].options) {
      data[0].options.forEach((option: any) => {
        if (option.default !== undefined && option.choices[option.default]) {
          dispatch(setOption({
            name: option.name,
            value: option.choices[option.default].label
          }));
        }
      });
    }
  };

  useEffect(() => {
    getProduct();
  }, [idQuery]);

  if (status === "error" || status === "notFound") {
    return (
      <main className={styles.mainProductLoading}>
        <section className={styles.hero} />
        {status === "error" ? (
          <StatusMessage variant="error" onRetry={getProduct} />
        ) : (
          <StatusMessage
            variant="empty"
            title="Proizvod nije pronađen"
            text="Moguće je da proizvod više nije u ponudi. Pogledajte ostale proizvode ili nas kontaktirajte."
          />
        )}
      </main>
    );
  }

  if (!product) return <ProductPageLoading />;

  return (
    <main className={styles.mainProduct}>
      <PurchaseModal
        open={purchaseModalOpen}
        handleClose={() => setPurchaseModalOpen(false)}
        product={product}
      />

      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Main Container */}
      <div className={styles.container}>

        {/* TOP SECTION: Grid */}
        <div className={styles.topSection}>

          {/* Left Column: Images */}
          <motion.div
            className={styles.carouselHolder}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={{
              visible: { opacity: 1, scale: 1 },
              hidden: { opacity: 0, scale: 0.95 },
            }}
          >
            {/* 3D Model Section */}
            {product.model_path ? (
              <div className={styles.sceneWrapper}>
                <KitchenScene
                  product={product}
                  configuration={configuration}
                />
              </div>
            ) : imageUrls.length > 0 ? (
              <ProductImagesCarousel images={imageUrls} options={OPTIONS} />
            ) : null}


          </motion.div>

          {/* Right Column: Details */}
          <section className={styles.details}>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06 }}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 20 },
              }}
            >
              {product.name}
            </motion.h2>
            <motion.p
              className={styles.price}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.09 }}
              variants={{
                visible: { opacity: 1 },
                hidden: { opacity: 0 },
              }}
            >
              Od {formatPrice(product.price)}
            </motion.p>
            <motion.p
              className={styles.description}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 }}
              variants={{
                visible: { opacity: 1 },
                hidden: { opacity: 0 },
              }}
            >
              {product.description}
            </motion.p>

            {product.options && product.options.length > 0 && (
              <div>
                {product.options.map((option: ProductOption) => (
                  <div key={option.name} className={styles.optionGroup}>
                    {/* Header */}
                    <div className={styles.optionHeader}>
                      <h3>{option.name}</h3>
                      <span
                        className={clsx(
                          styles.selectedValue,
                          configuration[option.name] ? styles.selected : styles.placeholder
                        )}
                      >
                        {configuration[option.name] || "Odaberite..."}
                      </span>
                    </div>

                    {/* Swatches Grid */}
                    <div className={styles.swatches}>
                      {option.choices.map((choice: OptionChoice) => (
                        <button
                          key={choice.label}
                          onClick={() => dispatch(setOption({ name: option.name, value: choice.label }))}
                          className={clsx(
                            styles.swatch,
                            configuration[option.name] === choice.label && styles.selected
                          )}
                          style={{
                            backgroundColor: choice.type === 'color' ? choice.hex : undefined,
                            backgroundImage: choice.type === 'texture' && choice.texture ? `url(${choice.texture})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          title={choice.label}
                          aria-label={choice.label}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.buttons}>
              <motion.button
                className={styles.orderButton}
                onClick={() => setPurchaseModalOpen(true)}
                disabled={product?.options && product.options.length > 0 && !areAllOptionsSelected}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18 }}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 20 },
                }}
              >
                Zatraži ponudu
              </motion.button>

              <motion.button
                className={styles.contactButton}
                onClick={() => router.push("/kontakt")}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24 }}
                variants={{
                  visible: { opacity: 1 },
                  hidden: { opacity: 0 },
                }}
              >
                Imate pitanja? Kontaktirajte nas <HiArrowSmRight />
              </motion.button>
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION: Tabs */}
        <div className={styles.bottomSection}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Manual Tabs Implementation */}
            <div className={styles.tabsHeader}>
              <button
                className={clsx(styles.tabButton, activeTab === "specifikacije" && styles.active)}
                onClick={() => setActiveTab("specifikacije")}
              >
                Mogućnosti & Detalji
              </button>
              <button
                className={clsx(styles.tabButton, activeTab === "proces" && styles.active)}
                onClick={() => setActiveTab("proces")}
              >
                Proces Narudžbe
              </button>
              <button
                className={clsx(styles.tabButton, activeTab === "dostava" && styles.active)}
                onClick={() => setActiveTab("dostava")}
              >
                Dostava
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "specifikacije" && (
                <div className={styles.specsGrid}>
                  <div className={styles.specRow}>
                    <span className={styles.label}>Korpus</span>
                    <span className={styles.value}>Iveral 18mm (Egger)</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.label}>Fronte</span>
                    <span className={styles.value}>MDF Lakirani ili Akril (19mm)</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.label}>Okovi</span>
                    <span className={styles.value}>Blum Soft-Close (Doživotno jamstvo)</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.label}>Radna ploča</span>
                    <span className={styles.value}>Otporna na vlagu (38mm)</span>
                  </div>
                </div>
              )}

              {activeTab === "proces" && (
                <ul className={styles.processGrid}>
                  <li className={styles.processStep}>
                    <div className={styles.stepNumber}>1</div>
                    <div>
                      <h5>Online Upit</h5>
                      <p>Odaberite boje i pošaljite neobavezujući upit.</p>
                    </div>
                  </li>
                  <li className={styles.processStep}>
                    <div className={styles.stepNumber}>2</div>
                    <div>
                      <h5>Izmjera</h5>
                      <p>Kontaktiramo vas za termin točne izmjere.</p>
                    </div>
                  </li>
                  <li className={styles.processStep}>
                    <div className={styles.stepNumber}>3</div>
                    <div>
                      <h5>3D Dizajn</h5>
                      <p>Izrada nacrta i finalna ponuda.</p>
                    </div>
                  </li>
                  <li className={styles.processStep}>
                    <div className={styles.stepNumber}>4</div>
                    <div>
                      <h5>Montaža</h5>
                      <p>Isporuka i montaža u roku 4-6 tjedana.</p>
                    </div>
                  </li>
                </ul>
              )}

              {activeTab === "dostava" && (
                <div className={styles.deliveryBox}>
                  <p>
                    <span>Besplatna dostava i montaža</span> vrijedi za područje grada Zagreba i zagrebačkog prstena.
                    <br /><br />
                    Za dostavu u druge dijelove Hrvatske ili otoke, cijena se formira na upit ovisno o udaljenosti i obujmu narudžbe. Kontaktirajte nas za preciznu ponudu.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductPageContent />
    </Suspense>
  );
}
