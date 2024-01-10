import React, { useEffect, useState, useRef } from "react";
import styles from "@/styles/components/admin/modals/AddProductModal.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@mui/material/Modal";

import { HiOutlinePlusCircle } from "react-icons/hi2";

import { motion } from "framer-motion";

import { HiXMark } from "react-icons/hi2";

import { ProductType } from "@/types/product";

type ImageType = {
  url: string;
  pathname: string;
};

function DeleteProduct({
  close,
  productId,
}: {
  close: () => void;
  productId: number;
}) {
  const supabase = createClientComponentClient();

  const deleteMessage = async () => {
    await supabase.from("products").delete().eq("id", productId);

    close();
  };

  return (
    <section className={styles.deleteModal}>
      <section className={styles.top}>
        <h3>Brisanje Proizvoda</h3>
        <HiXMark onClick={close} />
      </section>

      <section className={styles.deleteContent}>
        <h1>Jeste li sigurni da želite obrisati proizvod?</h1>
        <p>
          Nakon brisanja, ovaj proizvod se ne može vratiti te je zauvijek
          obrisan.
        </p>
      </section>

      <section className={styles.buttons}>
        <button className={styles.delete} onClick={deleteMessage}>
          Obriši
        </button>
        <button onClick={close}>Odustani</button>
      </section>
    </section>
  );
}

function UpdateProductModal({
  product,
  handleClose,
  updateData,
}: {
  product: ProductType | null;
  handleClose: () => void;
  updateData: () => void;
}) {
  const supabase = createClientComponentClient();

  const [images, setImages] = useState<ImageType[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);

  const [canUpdate, setCanUpdate] = useState<boolean>(false);

  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset all values
  const reset = () => {
    setDeleting(false);
    setImages([]);
    setName("");
    setPrice(0);
    setDescription("");
    setCategory(null);
  };

  const close = () => {
    updateData();
    reset();
    handleClose();
  };

  const updateProduct = async (e: any) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("products")
      .update([
        {
          name: name,
          price: price,
          description: description,
          category: category,
          images: images,
        },
      ])
      .match({ id: product!.id });

    console.log(data, error);

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

        console.log(urlData);

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

    console.log(data, error);

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
      setCanUpdate(true);
    } else {
      setCanUpdate(false);
    }
  }, [name, price, description, category, images]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description);
      setCategory(product.category);
      setImages(product.images);
    }
  }, [product]);

  if (!product) return null;

  return (
    <Modal
      open={product !== null}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {deleting ? (
        <DeleteProduct close={close} productId={product.id} />
      ) : (
        <section className={styles.addProductModal}>
          <section className={styles.top}>
            <h3>Ažuriraj Proizvod</h3>
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
                  value={name}
                />
              </section>

              <section className={styles.price}>
                <label htmlFor="price">Cijena {"(€):"}</label>
                <input
                  type="number"
                  id="price"
                  placeholder="Cijena u eurima"
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  value={price}
                />
              </section>

              <section className={styles.description}>
                <label htmlFor="description">Opis:</label>
                <textarea
                  name="description"
                  id="description"
                  placeholder="Kratki opis proizvoda"
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
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
                    className={
                      category === "rooms" ? styles.selected : undefined
                    }
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
              className={`${canUpdate ? styles.add : styles.disabled}`}
              onClick={updateProduct}
              disabled={!canUpdate}
            >
              Ažuriraj
            </button>
            <button className={styles.delete} onClick={() => setDeleting(true)}>
              Obriši
            </button>
            <button onClick={close}>Odustani</button>
          </section>
        </section>
      )}
    </Modal>
  );
}

export default UpdateProductModal;
