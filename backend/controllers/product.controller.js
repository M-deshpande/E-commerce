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
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {   
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error.message);
      }
    }

    await product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message  })
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: 
        { size: 3 } 
      }, // Randomly select 3 products
      {
        $project: {
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1
        }
      }
    ]);
    res.json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const{ category }= req.params;
  try {

    const products = await Product.find({ category });
    res.json({ products });

  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};