import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

export const signup = async (req, res) => {
    const {name, email, password} = req.body;
  try {
    const userExists = await User.findOne({email});

    if (userExists) {
        return res.status(400).json({message: "User already exists"});  
    }

    const user = await User.create({name, email, password});

    //autheticate 
    const {accessToken, refreshToken} = generateTokens(user._id);

    res.status(201).json({message: "User created successfully", user});

  } catch (error) {
    res.status(500).json({message: "Error creating user", error :error.message});

  }
}

export const login = async (req, res) => {
  res.send("Login route called");
}

export const logout = async (req, res) => {
  res.send("Logout route called");
}