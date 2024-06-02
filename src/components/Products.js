import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { CircularProgress, Grid, InputAdornment, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const isLoggedIn = localStorage.getItem("username") || false;
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [initialCartItems, setInitialCartItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const renderProductGrid = (addToCart) => {
    if (loading) {
      return (
        <Grid container spacing={0} alignItems="center" justifyContent="center">
          <CircularProgress />
          <p>Loading Products</p>
        </Grid>
      );
    }

    if (filteredProducts.length > 0) {
      return filteredProducts.map((product) => (
        <Grid item xs={12} sm={6} md={3} key={product._id}>
          <ProductCard product={product} addToCart={addToCart} />
        </Grid>
      ));
    }

    return (
      <Grid container spacing={0} alignItems="center" justifyContent="center">
        <SentimentDissatisfied />
        <p>No products found</p>
      </Grid>
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFilteredProducts([]);
        setLoading(false);
      }
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${searchQuery}`
      );
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFilteredProducts([]);
        setLoading(false);
      }
    }
  };

  const fetchCart = async (token) => {
    if (!token) return;

    const axiosHeaders = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: axiosHeaders,
      });
      setInitialCartItems(response.data);
      setCartItems(response.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  const isItemInCart = (items, productId) => {
    return items.some((item) => item.productId === productId);
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    const data = {
      productId,
      qty,
    };

    const axiosConfig = {
      method: "post",
      url: `${config.endpoint}/cart`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    };

    try {
      const response = await axios(axiosConfig);
      if (options.delete) {
        enqueueSnackbar("Product removed from cart", { variant: "success" });
      } else if (options.fromProducts) {
        enqueueSnackbar("Product added to cart", { variant: "success" });
      } else {
        enqueueSnackbar("Product quantity updated", { variant: "success" });
      }
      setCartItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = (productId) => {
    addToCart(token, cartItems, products, productId, 1, {
      fromProducts: true,
      preventDuplicate: true,
    });
  };

  const handleQuantity = (productId, quantity) => {
    const options = { preventDuplicate: false };
    if (quantity === 0) {
      options.delete = true;
    }
    addToCart(token, cartItems, products, productId, quantity, options);
  };

  const renderCart = () => {
    if (isLoggedIn) {
      return (
        <Grid bgcolor="#E9F5E1" item md={3}>
          <Cart
            handleQuantity={handleQuantity}
            products={products}
            items={cartItems}
          />
        </Grid>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchProducts();
    fetchCart(token);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
    } else {
      clearTimeout(searchTimer);
      const timerId = setTimeout(searchProducts, 500);
      setSearchTimer(timerId);
    }
  }, [searchQuery]);

  return (
    <div>
      <Header
        searchBox={
          <TextField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="search-desktop"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
          />
        }
      />

      <TextField
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />

      <Grid container direction="row">
        <Grid item md>
          <Grid>
            <Box className="hero">
              <p className="hero-heading">
                India's{" "}
                <span className="hero-highlight">FASTEST DELIVERY</span> to your
                door step
              </p>
            </Box>
          </Grid>
          <Grid container className="product-grid">
            {renderProductGrid(handleAddToCart)}
          </Grid>
        </Grid>
        {renderCart()}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;