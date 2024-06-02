import { AddShoppingCart } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, addToCart }) => {
  const handleAddToCart = () => {
    addToCart(product._id);
  };

  return (
    <Card className="product-card">
      <CardMedia component="img" image={product.image} alt={product.name} />
      <CardContent>
        <Typography variant="subtitle1" color="textPrimary">
          {product.name}
        </Typography>
        <Typography variant="h6" color="textPrimary" gutterBottom>
          ${product.cost}
        </Typography>
        <Rating
          name="product-rating"
          value={product.rating}
          precision={0.5}
          readOnly
        />
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCart />}
          fullWidth
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
