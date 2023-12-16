import React, { useEffect, useState } from "react";
import styles from "@/styles/components/admin/modals/AddProductModal.module.scss";

import Modal from "@mui/material/Modal";

import { HiOutlinePlusCircle } from "react-icons/hi2";

import { motion } from "framer-motion";

import { HiXMark } from "react-icons/hi2";

function AddProductModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<number | null>(null);

  const [canAdd, setCanAdd] = useState<boolean>(false);

  // Reset all values
  const reset = () => {
    setImages([]);
    setName("");
    setPrice(0);
    setDescription("");
    setCategory(null);
  };

  const close = () => {
    reset();
    handleClose();
  };

  const addProduct = () => {
    close();
  };

  useEffect(() => {
    if (
      name.length > 0 &&
      price > 0 &&
      description.length > 0 &&
      category !== null
    ) {
      setCanAdd(true);
    } else {
      setCanAdd(false);
    }
  }, [name, price, description, category]);

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <section className={styles.addProductModal}>
        <section className={styles.top}>
          <h3>Dodaj Proizvod</h3>
          <HiXMark onClick={close} />
        </section>

        <section className={styles.content}>
          <div className={styles.image}>
            {images.length > 0 && (
              <img
                src={images[0]}
                alt="Add Image Thumbnail"
                className={styles.thumbnail}
              />
            )}
            <div
              className={styles.thumbnail}
              style={{ opacity: images.length > 0 ? 0.6 : 0.1 }}
            />
            <HiOutlinePlusCircle />
          </div>

          <section className={styles.info}>
            <section className={styles.name}>
              <label htmlFor="name">Naziv:</label>
              <input
                type="text"
                id="name"
                placeholder="Naziv proizvoda"
                onChange={(e) => setName(e.target.value)}
              />
            </section>

            <section className={styles.price}>
              <label htmlFor="price">Cijena {"(€):"}</label>
              <input
                type="number"
                id="price"
                placeholder="Cijena u eurima"
                onChange={(e) => setPrice(parseInt(e.target.value))}
              />
            </section>

            <section className={styles.description}>
              <label htmlFor="description">Opis:</label>
              <textarea
                name="description"
                id="description"
                placeholder="Kratki opis proizvoda"
                rows={6}
                onChange={(e) => setDescription(e.target.value)}
              />
            </section>

            <section className={styles.category}>
              <label htmlFor="category">Kategorija:</label>
              <div className={styles.select}>
                <div
                  className={category === 0 ? styles.selected : undefined}
                  onClick={() => setCategory(0)}
                >
                  <p>Kuhinje</p>
                </div>
                <div
                  className={category === 1 ? styles.selected : undefined}
                  onClick={() => setCategory(1)}
                >
                  <p>Dječje Sobe</p>
                </div>
                <div
                  className={category === 2 ? styles.selected : undefined}
                  onClick={() => setCategory(2)}
                >
                  <p>Namještaj</p>
                </div>
              </div>
            </section>
          </section>
        </section>

        <section className={styles.buttons}>
          <button
            className={`${canAdd ? styles.add : styles.disabled}`}
            onClick={addProduct}
            disabled={!canAdd}
          >
            Dodaj
          </button>
          <button onClick={close}>Odustani</button>
        </section>
      </section>
    </Modal>
  );
}

export default AddProductModal;
