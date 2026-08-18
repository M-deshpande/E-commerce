import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Redis from "../lib/redis.js";
import dotenv from "dotenv";

dotenv.config();

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const storeRefreshToken = async(userId, refreshToken) => {
  await Redis.set(`refreshToken:${userId}`, refreshToken,   {
    ex: 7 * 24 * 60 * 60,
  }); // Store for 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Strict', // Prevents CSRF attacks
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Strict', // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

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
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({message: "User created successfully", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({message: "Error creating user", error :error.message});

  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email});
    if (user && await (user.comparePassword(password))) {

      const {accessToken, refreshToken} = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
      });
      
    } else {
      res.status(401).json({message: "Invalid email or password"});
    }
  } catch (error) {
    res.status(500).json({message: "Error logging in", error :error.message});
  }
}

export const logout = async (req, res) => {
  try{
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await Redis.del(`refreshToken:${decoded.userId}`);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({message: "Logged out successfully"});
  } catch (error) {
    res.status(500).json({message: "Error logging out", error :error.message});
  }
}

export const refreshToken = async (req, res) => {
  try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({message: "Refresh token not found"});
      }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await Redis.get(`refreshToken:${decoded.userId}`);

    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({message: "Invalid refresh token"});
    }

    const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.json({message: "Access token refreshed"});
} catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({message: "Error refreshing token", error :error.message});
  }
}