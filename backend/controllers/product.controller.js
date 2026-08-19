import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({products});
  } catch (error) {
    console.log("Error in getAllProducts cotroller", error.message);
    res.status(500).json({ message: "Server error", error: error.message  });
  }
};

export const getFeaturedProducts = async(req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if(featuredProducts){
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({isFeatured: true}).lean();

    if(!featuredProducts){
      return res.status(404).json({message: "No featured products found"});
    }

    await redis.set("featuredProducts", JSON.stringify(featuredProducts));

    res.json({featuredProducts});
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message  })
  }
};

export const createProduct = async (req, res) => {
  try {
  const { name, description, price, image, category } = req.body;
  
  let cloudinaryResponse = null;
  if(image) {
    cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "products",
      resource_type: "image"
    });
  }

  const product = new Product({
    name,
    description,
    price,
    image: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
    category
  });

  res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message  })
  }
}