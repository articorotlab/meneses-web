"use client";

import {
  ArrowLeft,
  Check,
  ImageIcon,
  Images,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


type AttractionImage = {
  id: string;
  url: string;
  sortOrder: number;
  createdAt?: string;
};


type Attraction = {
  id: string;
  name: string;
  sortOrder: number;
  images: AttractionImage[];
  createdAt?: string;
  updatedAt?: string;
};


type ContentResponse = {
  coverImageUrl: string | null;
  attractions: Attraction[];
};


type MessageState = {
  type: "success" | "error";
  text: string;
};


function getAssetUrl(
  path:
    string | null
) {

  if (
    !path
  ) {
    return "";
  }


  if (
    /^https?:\/\//i.test(
      path
    )
  ) {
    return path;
  }


  if (
    typeof window ===
      "undefined"
  ) {
    return path;
  }


  return (
    `${window.location.protocol}//` +
    `${window.location.hostname}:3001` +
    path
  );
}


async function readJsonResponse(
  response:
    Response
) {

  const data =
    await response.json();


  if (
    !response.ok
  ) {

    throw new Error(
      data.message ??
      data.error ??
      "Ocurrió un error."
    );
  }


  return data;
}


export default function ContentDashboard({
  userName,
}: {
  userName:
    string;
}) {

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const newAttractionImagesRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const editImagesInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    content,
    setContent,
  ] =
    useState<ContentResponse>({
      coverImageUrl:
        null,

      attractions:
        [],
    });


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    coverSaving,
    setCoverSaving,
  ] =
    useState(
      false
    );


  const [
    coverFile,
    setCoverFile,
  ] =
    useState<File | null>(
      null
    );


  const [
    coverPreview,
    setCoverPreview,
  ] =
    useState<string | null>(
      null
    );


  const [
    coverMessage,
    setCoverMessage,
  ] =
    useState<MessageState | null>(
      null
    );


  const [
    showCreateForm,
    setShowCreateForm,
  ] =
    useState(
      false
    );


  const [
    newAttractionName,
    setNewAttractionName,
  ] =
    useState(
      ""
    );


  const [
    newAttractionFiles,
    setNewAttractionFiles,
  ] =
    useState<File[]>(
      []
    );


  const [
    creatingAttraction,
    setCreatingAttraction,
  ] =
    useState(
      false
    );


  const [
    createMessage,
    setCreateMessage,
  ] =
    useState<MessageState | null>(
      null
    );


  const [
    editingAttractionId,
    setEditingAttractionId,
  ] =
    useState<string | null>(
      null
    );


  const [
    editingName,
    setEditingName,
  ] =
    useState(
      ""
    );


  const [
    editingSaving,
    setEditingSaving,
  ] =
    useState(
      false
    );


  const [
    editingMessage,
    setEditingMessage,
  ] =
    useState<MessageState | null>(
      null
    );


  const [
    deletingAttractionId,
    setDeletingAttractionId,
  ] =
    useState<string | null>(
      null
    );


  const [
    uploadingImages,
    setUploadingImages,
  ] =
    useState(
      false
    );


  const [
    imageDeletingId,
    setImageDeletingId,
  ] =
    useState<string | null>(
      null
    );


  const [
    confirmDeleteAttraction,
    setConfirmDeleteAttraction,
  ] =
    useState<Attraction | null>(
      null
    );


  const loadContent =
    useCallback(
      async () => {

        try {

          const response =
            await fetch(
              "/api/admin/content",
              {
                cache:
                  "no-store",
              }
            );


          const data =
            await readJsonResponse(
              response
            );


          setContent({
            coverImageUrl:
              data.coverImageUrl ??
              null,

            attractions:
              Array.isArray(
                data.attractions
              )
                ? data.attractions
                : [],
          });


        } catch (
          currentError
        ) {

          setCreateMessage({
            type:
              "error",

            text:
              currentError instanceof Error
                ? currentError.message
                : "No fue posible cargar el contenido.",
          });


        } finally {

          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {

      void loadContent();

    },
    [
      loadContent,
    ]
  );


  useEffect(
    () => {

      return () => {

        if (
          coverPreview
        ) {

          URL.revokeObjectURL(
            coverPreview
          );
        }
      };

    },
    [
      coverPreview,
    ]
  );


  const currentCoverUrl =
    useMemo(
      () => {

        if (
          coverPreview
        ) {
          return coverPreview;
        }


        return getAssetUrl(
          content.coverImageUrl
        );
      },
      [
        coverPreview,
        content.coverImageUrl,
      ]
    );


  function handleCoverSelection(
    event:
      ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files
        ?.item(
          0
        ) ??
      null;


    if (
      !file
    ) {
      return;
    }


    if (
      coverPreview
    ) {

      URL.revokeObjectURL(
        coverPreview
      );
    }


    setCoverFile(
      file
    );

    setCoverPreview(
      URL.createObjectURL(
        file
      )
    );

    setCoverMessage(
      null
    );
  }


  async function saveCover() {

    if (
      !coverFile
    ) {
      return;
    }


    setCoverSaving(
      true
    );

    setCoverMessage(
      null
    );


    try {

      const formData =
        new FormData();


      formData.append(
        "image",
        coverFile
      );


      const response =
        await fetch(
          "/api/admin/content/cover",
          {
            method:
              "PUT",

            body:
              formData,
          }
        );


      const data =
        await readJsonResponse(
          response
        );


      if (
        coverPreview
      ) {

        URL.revokeObjectURL(
          coverPreview
        );
      }


      setCoverPreview(
        null
      );

      setCoverFile(
        null
      );

      setContent(
        (
          current
        ) => ({
          ...current,

          coverImageUrl:
            data.coverImageUrl ??
            current.coverImageUrl,
        })
      );


      if (
        coverInputRef.current
      ) {

        coverInputRef.current.value =
          "";
      }


      setCoverMessage({
        type:
          "success",

        text:
          "Portada actualizada correctamente.",
      });


    } catch (
      currentError
    ) {

      setCoverMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible actualizar la portada.",
      });


    } finally {

      setCoverSaving(
        false
      );
    }
  }


  function handleNewAttractionFiles(
    event:
      ChangeEvent<HTMLInputElement>
  ) {

    const files =
      Array.from(
        event.target.files ??
        []
      );


    setNewAttractionFiles(
      files
    );

    setCreateMessage(
      null
    );
  }


  async function uploadImagesToAttraction(
    attractionId:
      string,

    files:
      File[]
  ) {

    for (
      const file
      of files
    ) {

      const formData =
        new FormData();


      formData.append(
        "image",
        file
      );


      const response =
        await fetch(
          `/api/admin/attractions/${attractionId}/images`,
          {
            method:
              "POST",

            body:
              formData,
          }
        );


      await readJsonResponse(
        response
      );
    }
  }


  async function createAttraction() {

    const name =
      newAttractionName
        .trim();


    if (
      name.length <
        2
    ) {

      setCreateMessage({
        type:
          "error",

        text:
          "Escribe un nombre válido para la atracción.",
      });

      return;
    }


    if (
      newAttractionFiles.length ===
        0
    ) {

      setCreateMessage({
        type:
          "error",

        text:
          "Selecciona al menos una imagen.",
      });

      return;
    }


    setCreatingAttraction(
      true
    );

    setCreateMessage(
      null
    );


    try {

      const createResponse =
        await fetch(
          "/api/admin/attractions",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name,
              }),
          }
        );


      const createData =
        await readJsonResponse(
          createResponse
        );


      const attractionId =
        createData.attraction
          .id;


      try {

        await uploadImagesToAttraction(
          attractionId,
          newAttractionFiles
        );


      } catch (
        imageError
      ) {

        /*
         * Si alguna imagen falla, retiramos la atracción
         * recién creada para no dejar contenido incompleto.
         */

        await fetch(
          `/api/admin/attractions/${attractionId}`,
          {
            method:
              "DELETE",
          }
        );


        throw imageError;
      }


      await loadContent();


      setShowCreateForm(
        false
      );

      setNewAttractionName(
        ""
      );

      setNewAttractionFiles(
        []
      );


      if (
        newAttractionImagesRef.current
      ) {

        newAttractionImagesRef.current.value =
          "";
      }


      setCreateMessage({
        type:
          "success",

        text:
          "Atracción creada correctamente.",
      });


    } catch (
      currentError
    ) {

      setCreateMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible crear la atracción.",
      });


    } finally {

      setCreatingAttraction(
        false
      );
    }
  }


  function beginEdit(
    attraction:
      Attraction
  ) {

    setEditingAttractionId(
      attraction.id
    );

    setEditingName(
      attraction.name
    );

    setEditingMessage(
      null
    );
  }


  function closeEdit() {

    setEditingAttractionId(
      null
    );

    setEditingName(
      ""
    );

    setEditingMessage(
      null
    );


    if (
      editImagesInputRef.current
    ) {

      editImagesInputRef.current.value =
        "";
    }
  }


  async function saveAttractionName(
    attractionId:
      string
  ) {

    const name =
      editingName
        .trim();


    if (
      name.length <
        2
    ) {

      setEditingMessage({
        type:
          "error",

        text:
          "Escribe un nombre válido.",
      });

      return;
    }


    setEditingSaving(
      true
    );

    setEditingMessage(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/attractions/${attractionId}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name,
              }),
          }
        );


      await readJsonResponse(
        response
      );


      await loadContent();


      setEditingMessage({
        type:
          "success",

        text:
          "Nombre actualizado correctamente.",
      });


    } catch (
      currentError
    ) {

      setEditingMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible actualizar la atracción.",
      });


    } finally {

      setEditingSaving(
        false
      );
    }
  }


  async function addImages(
    attractionId:
      string,

    event:
      ChangeEvent<HTMLInputElement>
  ) {

    const files =
      Array.from(
        event.target.files ??
        []
      );


    if (
      files.length ===
        0
    ) {
      return;
    }


    setUploadingImages(
      true
    );

    setEditingMessage(
      null
    );


    try {

      await uploadImagesToAttraction(
        attractionId,
        files
      );


      await loadContent();


      setEditingMessage({
        type:
          "success",

        text:
          files.length === 1
            ? "Imagen agregada correctamente."
            : "Imágenes agregadas correctamente.",
      });


    } catch (
      currentError
    ) {

      setEditingMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible agregar las imágenes.",
      });


    } finally {

      setUploadingImages(
        false
      );


      event.target.value =
        "";
    }
  }


  async function deleteImage(
    attractionId:
      string,

    imageId:
      string
  ) {

    setImageDeletingId(
      imageId
    );

    setEditingMessage(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/attractions/${attractionId}/images/${imageId}`,
          {
            method:
              "DELETE",
          }
        );


      await readJsonResponse(
        response
      );


      await loadContent();


      setEditingMessage({
        type:
          "success",

        text:
          "Imagen eliminada correctamente.",
      });


    } catch (
      currentError
    ) {

      setEditingMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible eliminar la imagen.",
      });


    } finally {

      setImageDeletingId(
        null
      );
    }
  }


  async function deleteAttraction(
    attraction:
      Attraction
  ) {

    setDeletingAttractionId(
      attraction.id
    );

    setEditingMessage(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/attractions/${attraction.id}`,
          {
            method:
              "DELETE",
          }
        );


      await readJsonResponse(
        response
      );


      setConfirmDeleteAttraction(
        null
      );

      closeEdit();

      await loadContent();


      setCreateMessage({
        type:
          "success",

        text:
          "Atracción eliminada correctamente.",
      });


    } catch (
      currentError
    ) {

      setEditingMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible eliminar la atracción.",
      });


    } finally {

      setDeletingAttractionId(
        null
      );
    }
  }


  const editingAttraction =
    content.attractions.find(
      (
        attraction
      ) =>
        attraction.id ===
        editingAttractionId
    ) ??
    null;


  return (

    <main className="admin-content-page">


      <header className="admin-dashboard-header">

        <div className="admin-dashboard-shell admin-header-inner">

          <div className="admin-content-header-left">

            <a
              href="/admin"
              className="admin-content-back"
            >
              <ArrowLeft
                size={18}
              />

              Panel administrativo
            </a>


            <span className="admin-content-user">
              {userName}
            </span>

          </div>

        </div>

      </header>


      <div className="admin-dashboard-shell admin-content-main">


        <div className="admin-content-heading">

          <div className="admin-module-icon purple">

            <ImageIcon
              size={25}
            />

          </div>


          <div>

            <span>
              Contenido del sitio
            </span>

            <h1>
              Contenido público
            </h1>

            <p>
              Administra la imagen de portada y las
              atracciones que aparecen en la página
              pública de la feria.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="content-loading">

            <LoaderCircle
              size={22}
              className="content-spin"
            />

            Cargando contenido...

          </div>

        ) : (

          <>


            <section className="content-card">

              <div className="content-section-heading">

                <div>

                  <span className="content-kicker">
                    Imagen principal
                  </span>

                  <h2>
                    Portada de la feria
                  </h2>

                  <p>
                    Esta imagen será la principal
                    presentación visual del sitio.
                  </p>

                </div>

              </div>


              <div className="cover-editor">

                <div className="cover-preview">

                  {currentCoverUrl ? (

                    <img
                      src={
                        currentCoverUrl
                      }
                      alt="Portada de la feria"
                    />

                  ) : (

                    <div className="cover-empty">

                      <ImageIcon
                        size={34}
                      />

                      <strong>
                        Sin imagen de portada
                      </strong>

                      <span>
                        Selecciona una imagen para comenzar.
                      </span>

                    </div>

                  )}

                </div>


                <div className="cover-controls">

                  <div>

                    <strong>
                      Imagen recomendada
                    </strong>

                    <span>
                      Horizontal. El servidor la optimiza
                      automáticamente a WebP 1600 × 900.
                      Máximo 20 MB.
                    </span>

                  </div>


                  <input
                    ref={
                      coverInputRef
                    }
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      handleCoverSelection
                    }
                  />


                  <div className="cover-actions">

                    <button
                      type="button"
                      className="content-button secondary"
                      disabled={
                        coverSaving
                      }
                      onClick={
                        () =>
                          coverInputRef.current
                            ?.click()
                      }
                    >
                      <Upload
                        size={16}
                      />

                      {content.coverImageUrl
                        ? "Cambiar imagen"
                        : "Seleccionar imagen"}

                    </button>


                    {coverFile && (

                      <button
                        type="button"
                        className="content-button primary"
                        disabled={
                          coverSaving
                        }
                        onClick={
                          () =>
                            void saveCover()
                        }
                      >

                        {coverSaving ? (

                          <LoaderCircle
                            size={16}
                            className="content-spin"
                          />

                        ) : (

                          <Save
                            size={16}
                          />

                        )}

                        {coverSaving
                          ? "Guardando..."
                          : "Guardar nueva portada"}

                      </button>

                    )}

                  </div>


                  {coverFile && (

                    <span className="selected-file">
                      Archivo seleccionado: {coverFile.name}
                    </span>

                  )}


                  {coverMessage && (

                    <div
                      className={
                        `content-message ${coverMessage.type}`
                      }
                    >
                      {coverMessage.type === "success" && (

                        <Check
                          size={17}
                        />

                      )}

                      {coverMessage.text}
                    </div>

                  )}

                </div>

              </div>

            </section>


            <section className="content-card">

              <div className="attractions-heading">

                <div>

                  <span className="content-kicker">
                    Galería pública
                  </span>

                  <h2>
                    Atracciones
                  </h2>

                  <p>
                    Cada atracción tiene únicamente
                    nombre y una o varias imágenes.
                  </p>

                </div>


                <button
                  type="button"
                  className="content-button primary"
                  onClick={
                    () => {

                      setShowCreateForm(
                        true
                      );

                      setCreateMessage(
                        null
                      );
                    }
                  }
                >
                  <Plus
                    size={16}
                  />

                  Nueva atracción
                </button>

              </div>


              {createMessage && (

                <div
                  className={
                    `content-message ${createMessage.type}`
                  }
                >
                  {createMessage.type === "success" && (

                    <Check
                      size={17}
                    />

                  )}

                  {createMessage.text}
                </div>

              )}


              {showCreateForm && (

                <div className="new-attraction-panel">

                  <div className="panel-title-row">

                    <div>

                      <span className="content-kicker">
                        Nueva
                      </span>

                      <h3>
                        Agregar atracción
                      </h3>

                    </div>


                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Cerrar"
                      onClick={
                        () => {

                          setShowCreateForm(
                            false
                          );

                          setNewAttractionName(
                            ""
                          );

                          setNewAttractionFiles(
                            []
                          );

                          setCreateMessage(
                            null
                          );
                        }
                      }
                    >
                      <X
                        size={18}
                      />
                    </button>

                  </div>


                  <label className="content-field">

                    <span>
                      Nombre de la atracción
                    </span>

                    <input
                      type="text"
                      value={
                        newAttractionName
                      }
                      placeholder="Ej. Rueda de la Fortuna"
                      onChange={
                        (
                          event
                        ) =>
                          setNewAttractionName(
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <div className="image-picker-block">

                    <div>

                      <strong>
                        Imágenes
                      </strong>

                      <span>
                        Puedes seleccionar varias imágenes a la vez.
                      </span>

                    </div>


                    <input
                      ref={
                        newAttractionImagesRef
                      }
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={
                        handleNewAttractionFiles
                      }
                    />


                    <button
                      type="button"
                      className="content-button secondary"
                      onClick={
                        () =>
                          newAttractionImagesRef.current
                            ?.click()
                      }
                    >
                      <Images
                        size={16}
                      />

                      Seleccionar imágenes
                    </button>

                  </div>


                  {newAttractionFiles.length > 0 && (

                    <div className="selected-images-list">

                      {newAttractionFiles.map(
                        (
                          file,
                          index
                        ) => (

                          <div
                            key={
                              `${file.name}-${index}`
                            }
                          >
                            <ImageIcon
                              size={15}
                            />

                            <span>
                              {file.name}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  )}


                  <div className="panel-actions">

                    <button
                      type="button"
                      className="content-button secondary"
                      disabled={
                        creatingAttraction
                      }
                      onClick={
                        () =>
                          setShowCreateForm(
                            false
                          )
                      }
                    >
                      Cancelar
                    </button>


                    <button
                      type="button"
                      className="content-button primary"
                      disabled={
                        creatingAttraction
                      }
                      onClick={
                        () =>
                          void createAttraction()
                      }
                    >

                      {creatingAttraction ? (

                        <LoaderCircle
                          size={16}
                          className="content-spin"
                        />

                      ) : (

                        <Plus
                          size={16}
                        />

                      )}

                      {creatingAttraction
                        ? "Creando..."
                        : "Guardar atracción"}

                    </button>

                  </div>

                </div>

              )}


              {content.attractions.length === 0 ? (

                <div className="attractions-empty">

                  <Images
                    size={32}
                  />

                  <strong>
                    Aún no hay atracciones
                  </strong>

                  <span>
                    Agrega la primera atracción para
                    comenzar a construir la galería pública.
                  </span>

                </div>

              ) : (

                <div className="attraction-grid">

                  {content.attractions.map(
                    (
                      attraction
                    ) => {

                      const firstImage =
                        attraction.images[0]
                          ?.url ??
                        null;


                      return (

                        <article
                          className="attraction-card"
                          key={
                            attraction.id
                          }
                        >

                          <div className="attraction-card-image">

                            {firstImage ? (

                              <img
                                src={
                                  getAssetUrl(
                                    firstImage
                                  )
                                }
                                alt={
                                  attraction.name
                                }
                              />

                            ) : (

                              <div className="attraction-image-empty">

                                <ImageIcon
                                  size={28}
                                />

                                Sin imagen

                              </div>

                            )}

                          </div>


                          <div className="attraction-card-body">

                            <div>

                              <h3>
                                {attraction.name}
                              </h3>

                              <span>
                                {attraction.images.length === 1
                                  ? "1 imagen"
                                  : `${attraction.images.length} imágenes`}
                              </span>

                            </div>


                            <button
                              type="button"
                              className="content-button secondary small"
                              onClick={
                                () =>
                                  beginEdit(
                                    attraction
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                              />

                              Editar
                            </button>

                          </div>

                        </article>

                      );
                    }
                  )}

                </div>

              )}

            </section>

          </>

        )}

      </div>


      {editingAttraction && (

        <div className="content-modal-backdrop">

          <div
            className="content-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Editar atracción"
          >

            <div className="content-modal-header">

              <div>

                <span className="content-kicker">
                  Editar
                </span>

                <h2>
                  {editingAttraction.name}
                </h2>

              </div>


              <button
                type="button"
                className="icon-button"
                aria-label="Cerrar"
                disabled={
                  editingSaving ||
                  uploadingImages
                }
                onClick={
                  closeEdit
                }
              >
                <X
                  size={19}
                />
              </button>

            </div>


            <div className="content-modal-body">

              <label className="content-field">

                <span>
                  Nombre
                </span>

                <input
                  type="text"
                  value={
                    editingName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditingName(
                        event.target.value
                      )
                  }
                />

              </label>


              <button
                type="button"
                className="content-button primary"
                disabled={
                  editingSaving
                }
                onClick={
                  () =>
                    void saveAttractionName(
                      editingAttraction.id
                    )
                }
              >
                {editingSaving ? (

                  <LoaderCircle
                    size={16}
                    className="content-spin"
                  />

                ) : (

                  <Save
                    size={16}
                  />

                )}

                Guardar nombre
              </button>


              <div className="modal-divider" />


              <div className="modal-images-heading">

                <div>

                  <strong>
                    Imágenes
                  </strong>

                  <span>
                    {editingAttraction.images.length === 1
                      ? "1 imagen"
                      : `${editingAttraction.images.length} imágenes`}
                  </span>

                </div>


                <input
                  ref={
                    editImagesInputRef
                  }
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={
                    (
                      event
                    ) =>
                      void addImages(
                        editingAttraction.id,
                        event
                      )
                  }
                />


                <button
                  type="button"
                  className="content-button secondary small"
                  disabled={
                    uploadingImages
                  }
                  onClick={
                    () =>
                      editImagesInputRef.current
                        ?.click()
                  }
                >
                  {uploadingImages ? (

                    <LoaderCircle
                      size={15}
                      className="content-spin"
                    />

                  ) : (

                    <Plus
                      size={15}
                    />

                  )}

                  Agregar imágenes
                </button>

              </div>


              {editingAttraction.images.length === 0 ? (

                <div className="modal-no-images">
                  Esta atracción no tiene imágenes.
                </div>

              ) : (

                <div className="modal-image-grid">

                  {editingAttraction.images.map(
                    (
                      image
                    ) => (

                      <div
                        className="modal-image-item"
                        key={
                          image.id
                        }
                      >

                        <img
                          src={
                            getAssetUrl(
                              image.url
                            )
                          }
                          alt={
                            editingAttraction.name
                          }
                        />


                        <button
                          type="button"
                          aria-label="Eliminar imagen"
                          disabled={
                            imageDeletingId ===
                            image.id
                          }
                          onClick={
                            () =>
                              void deleteImage(
                                editingAttraction.id,
                                image.id
                              )
                          }
                        >
                          {imageDeletingId === image.id ? (

                            <LoaderCircle
                              size={15}
                              className="content-spin"
                            />

                          ) : (

                            <Trash2
                              size={15}
                            />

                          )}
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}


              {editingMessage && (

                <div
                  className={
                    `content-message ${editingMessage.type}`
                  }
                >
                  {editingMessage.type === "success" && (

                    <Check
                      size={17}
                    />

                  )}

                  {editingMessage.text}
                </div>

              )}


              <div className="danger-zone">

                <div>

                  <strong>
                    Eliminar atracción
                  </strong>

                  <span>
                    Se eliminará de la página pública junto
                    con todas sus imágenes.
                  </span>

                </div>


                <button
                  type="button"
                  className="content-button danger"
                  onClick={
                    () =>
                      setConfirmDeleteAttraction(
                        editingAttraction
                      )
                  }
                >
                  <Trash2
                    size={16}
                  />

                  Eliminar atracción
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {confirmDeleteAttraction && (

        <div className="content-modal-backdrop confirm">

          <div
            className="delete-confirmation"
            role="alertdialog"
            aria-modal="true"
          >

            <div className="delete-icon">

              <Trash2
                size={22}
              />

            </div>


            <h3>
              Eliminar atracción
            </h3>


            <p>
              ¿Seguro que quieres eliminar
              <strong>
                {" "}
                {confirmDeleteAttraction.name}
              </strong>
              ? También se eliminarán todas sus imágenes.
            </p>


            <div className="panel-actions">

              <button
                type="button"
                className="content-button secondary"
                disabled={
                  deletingAttractionId !==
                    null
                }
                onClick={
                  () =>
                    setConfirmDeleteAttraction(
                      null
                    )
                }
              >
                Cancelar
              </button>


              <button
                type="button"
                className="content-button danger"
                disabled={
                  deletingAttractionId !==
                    null
                }
                onClick={
                  () =>
                    void deleteAttraction(
                      confirmDeleteAttraction
                    )
                }
              >
                {deletingAttractionId ? (

                  <LoaderCircle
                    size={16}
                    className="content-spin"
                  />

                ) : (

                  <Trash2
                    size={16}
                  />

                )}

                Eliminar definitivamente
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
