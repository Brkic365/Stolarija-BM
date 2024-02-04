import React, { useEffect, useState, useRef } from "react";
import styles from "@/styles/components/admin/modals/AddProductModal.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@mui/material/Modal";

import { HiOutlinePlusCircle } from "react-icons/hi2";

import { motion } from "framer-motion";

import { HiXMark } from "react-icons/hi2";

type ImageType = {
  url: string;
  pathname: string;
};

function AddProductModal({
  open,
  handleClose,
  updateData,
}: {
  open: boolean;
  handleClose: () => void;
  updateData: () => void;
}) {
  const supabase = createClientComponentClient();

  const [images, setImages] = useState<ImageType[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);

  const [canAdd, setCanAdd] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const addProduct = async (e: any) => {
    e.preventDefault();

    const { data, error } = await supabase.from("products").insert([
      {
        name: name,
        price: price,
        description: description,
        category: category,
        images: images,
      },
    ]);

    updateData();

    close();
  };

  const uploadImages = async (e: any) => {
    e.preventDefault();

    let tempImages = images;

    for await (let file of e.target.files) {
      const noSpecialCharacters = file.name.replace(/[^a-zA-Z0-9 ]/g, "");

      const { data, error } = await supabase.storage
        .from("productImages")
        .upload(
          `public/${
            noSpecialCharacters + (Math.random() + 1).toString(36).substring(7)
          }`,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (!error && data) {
        const urlData = supabase.storage
          .from("productImages")
          .getPublicUrl(data.path);

        tempImages.push({ url: urlData.data.publicUrl, pathname: data.path });
      }
    }

    setImages([...tempImages]);
  };

  const deleteImage = async (index: number) => {
    let tempImages = images;

    let image = tempImages[index];

    tempImages.splice(index, 1);

    const { data, error } = await supabase.storage
      .from("productImages")
      .remove([image.pathname]);

    setImages([...tempImages]);
  };

  useEffect(() => {
    if (
      name.length > 0 &&
      price > 0 &&
      description.length > 0 &&
      category !== null &&
      images.length > 0
    ) {
      setCanAdd(true);
    } else {
      setCanAdd(false);
    }
  }, [name, price, description, category, images]);

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
          <div
            className={styles.image}
            onClick={() => fileInputRef!.current!.click()}
          >
            {images.length > 0 && (
              <img
                src={images[0].url}
                alt="Add Image Thumbnail"
                className={styles.thumbnail}
              />
            )}
            <div
              className={styles.thumbnail}
              style={{ opacity: images.length > 0 ? 0.6 : 0.1 }}
            />
            <HiOutlinePlusCircle />
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={uploadImages}
            />
          </div>
          <div className={styles.uploadedImages}>
            {images.map((image, index) => (
              <div
                className={styles.uploadedImage}
                style={{ backgroundImage: `url(${image.url})` }}
                key={index}
              >
                <motion.div
                  className={styles.delete}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteImage(index)}
                >
                  <HiXMark />
                </motion.div>
              </div>
            ))}
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
                  className={
                    category === "kitchens" ? styles.selected : undefined
                  }
                  onClick={() => setCategory("kitchens")}
                >
                  <p>Kuhinje</p>
                </div>
                <div
                  className={category === "rooms" ? styles.selected : undefined}
                  onClick={() => setCategory("rooms")}
                >
                  <p>Dječje Sobe</p>
                </div>
                <div
                  className={
                    category === "furniture" ? styles.selected : undefined
                  }
                  onClick={() => setCategory("furniture")}
                >
                  <p>Namještaj</p>
                </div>
                <div
                  className={
                    category === "closets" ? styles.selected : undefined
                  }
                  onClick={() => setCategory("closets")}
                >
                  <p>Ormari</p>
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
