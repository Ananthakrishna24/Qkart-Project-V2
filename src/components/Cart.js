import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

export const generateCartItemsFrom = (cartData, productsData) => {
  return cartData.map((cartItem) => {
    const productData = productsData.find(
      (product) => cartItem.productId === product._id
    );
    return { ...productData, qty: cartItem.qty };
  });
};

export const getTotalCartValue = (items = []) => {
  const totalValue = items.reduce((total, item) => {
    const itemCost = item.cost ? Number(item.cost) : 0;
    const itemQty = item.qty ? Number(item.qty) : 0;
    return total + itemCost * itemQty;
  }, 0);
  console.log("Total Cart Value", totalValue);
  return totalValue;
};

export const getTotalItems = (items = []) => {
  return items.reduce((total, item) => total + item.qty, 0);
};

const ItemQuantity = ({ value, onAdd, onRemove, readOnly }) => {
  if (readOnly) {
    return (
      <Stack direction="row" alignItems="center">
        <Box padding="0.5rem" data-testid="item-qty">
          Qty: {value}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={onRemove}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={onAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

export const CartItem = ({ item, handleQuantity, readOnly }) => {
  const onAdd = () => {
    handleQuantity(item._id, item.qty + 1);
  };

  const onRemove = () => {
    handleQuantity(item._id, Math.max(item.qty - 1, 0));
  };

  return (
    <Box display="flex" alignItems="flex-start" padding="1rem" key={item._id}>
      <Box className="image-container">
        <img src={item.image} alt={item.name} width="100%" height="100%" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="6rem"
        paddingX="1rem"
      >
        <div>{item.name}</div>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <ItemQuantity
            onAdd={onAdd}
            onRemove={onRemove}
            value={item.qty}
            readOnly={readOnly}
          />
          <Box padding="0.5rem" fontWeight="700">
            ${item.cost}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const Cart = ({ isReadOnly, products, items = [], handleQuantity }) => {
  const history = useHistory();
  const [totalCartValue, setTotalCartValue] = useState(
    Number(localStorage.getItem("totalCartValue")) || 0
  );

  useEffect(() => {
    const totalValue = getTotalCartValue(generateCartItemsFrom(items, products));
    setTotalCartValue(totalValue);
    localStorage.setItem("totalCartValue", totalValue);
  }, [items, products]);

  const hasItems = items.length > 0;
  const cartItems = generateCartItemsFrom(items, products);

  const checkoutButton = isReadOnly ? null : (
    <Box display="flex" justifyContent="flex-end" className="cart-footer">
      <Button
        color="primary"
        variant="contained"
        startIcon={<ShoppingCart />}
        className="checkout-btn"
        onClick={() => history.push("/checkout")}
      >
        Checkout
      </Button>
    </Box>
  );

  const orderDetails = isReadOnly ? (
    <Box className="cart">
      <Box
        paddingLeft="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <h2>Order Details</h2>
      </Box>

      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#3C3C3C" alignSelf="center">
          Products
        </Box>
        <Box color="#3C3C3C" alignSelf="center">
          {getTotalItems(cartItems)}
        </Box>
      </Box>

      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#3C3C3C" alignSelf="center">
          Subtotal
        </Box>
        <Box color="#3C3C3C" alignSelf="center">
          ${totalCartValue}
        </Box>
      </Box>

      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#3C3C3C" alignSelf="center">
          Shipping
        </Box>
        <Box color="#3C3C3C" alignSelf="center">
          $0
        </Box>
      </Box>

      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box
          color="#3C3C3C"
          alignSelf="center"
          fontWeight="700"
          fontSize="1.5rem"
        >
          Total
        </Box>
        <Box
          color="#3C3C3C"
          fontWeight="700"
          fontSize="1.5rem"
          alignSelf="center"
        >
          ${totalCartValue}
        </Box>
      </Box>
    </Box>
  ) : null;

  if (!hasItems) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {cartItems.map((item) => (
          <CartItem
            key={item._id}
            item={item}
            handleQuantity={handleQuantity}
            readOnly={isReadOnly}
          />
        ))}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${totalCartValue}
          </Box>
        </Box>
        {checkoutButton}
      </Box>
      {orderDetails}
    </>
  );
};

export default Cart;