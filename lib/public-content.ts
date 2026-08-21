const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ??
  "http://localhost:3001";


const PUBLIC_ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_MENESES_API_BASE_URL ??
  API_BASE_URL;


export type PublicAttractionImage = {
  id: string;
  url: string;
  sortOrder: number;
};


export type PublicAttraction = {
  id: string;
  name: string;
  images: PublicAttractionImage[];
};


export type PublicContent = {
  coverImageUrl: string | null;
  attractions: PublicAttraction[];
};


function absoluteAssetUrl(
  value:
    string | null
): string | null {

  if (
    !value
  ) {
    return null;
  }


  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    return value;
  }


  return (
    `${PUBLIC_ASSET_BASE_URL}` +
    `${value}`
  );
}


export async function getPublicContent():
  Promise<PublicContent> {

  const response =
    await fetch(
      `${API_BASE_URL}/public/content`,
      {
        cache:
          "no-store",
      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      "PUBLIC_CONTENT_REQUEST_FAILED"
    );
  }


  const data =
    await response.json();


  return {
    coverImageUrl:
      absoluteAssetUrl(
        data.coverImageUrl ??
        null
      ),

    attractions:
      Array.isArray(
        data.attractions
      )
        ? data.attractions.map(
            (
              attraction:
                any
            ) => ({
              id:
                String(
                  attraction.id
                ),

              name:
                String(
                  attraction.name
                ),

              images:
                Array.isArray(
                  attraction.images
                )
                  ? attraction.images.map(
                      (
                        image:
                          any
                      ) => ({
                        id:
                          String(
                            image.id
                          ),

                        url:
                          absoluteAssetUrl(
                            image.url
                          ) ??
                          "",

                        sortOrder:
                          Number(
                            image.sortOrder ??
                            0
                          ),
                      })
                    )
                  : [],
            })
          )
        : [],
  };
}
