export const getCartProducts = async (req, res) => {
    try {
        const products = await product.find({ _id: { $in: req.user.cartItems } });
        
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
            return {
                ...product.toJson(),
                quantity: item ? item.quantity : 1
            };
        });

        res.json(cartItems);

    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Error fetching cart products" });
    }
};

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingCartItem = user.cart.find(item => item.id === productId);
        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Error adding to cart" });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        if(!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const existingCartItem = user.cart.find(item => item.id === productId);
        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: "Error removing from cart" });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const {id : productId} = req.body;
        const {quantity} = req.body;
        const user = req.user;
        const existingCartItem = user.cartItems.find((item) => item.id === productId);

        if(existingCartItem) {
            if(quantity == 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            } 

            existingCartItem.quantity = quantity;
            await user.save();
            return res.json(user.cartItems);

        } 
        else {
            return res.status(404).json({ message: "Product not found in cart" });
        }

    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Error updating quantity" });
    }
};

