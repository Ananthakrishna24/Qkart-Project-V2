import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { config } from "../App";
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CreditCard, Delete } from "@mui/icons-material";
import Header from "./Header";
import Footer from "./Footer";
import Cart, {
  getTotalCartValue,
  generateCartItemsFrom,
  getTotalItems,
} from "./Cart";
import "./Checkout.css";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) =>
          handleNewAddress({ ...newAddress, value: e.target.value })
        }
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => {
            addAddress(token, newAddress);
            handleNewAddress({ value: "", isAddingNewAddress: false });
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() =>
            handleNewAddress({ value: "", isAddingNewAddress: false })
          }
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddresses({ ...addresses, all: response.data });
      setNewAddress({ value: "", isAddingNewAddress: false });
      enqueueSnackbar("Address added successfully", { variant: "success" });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddresses({ ...addresses, all: response.data });
      enqueueSnackbar("Address deleted successfully", { variant: "success" });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    console.log("Items", items);
    if (getTotalItems(items) === 0) {
      enqueueSnackbar("Add some items to the cart!", { variant: "warning" });
      return false;
    }
    if (addresses.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }
    const totalCartValue = localStorage.getItem("totalCartValue");
    const walletBalance = localStorage.getItem("balance");
    if (totalCartValue > walletBalance) {
      enqueueSnackbar(
        `You do not have enough balance in your wallet for this purchase. Your wallet balance is $${walletBalance}.`,
        { variant: "warning" }
      );
      return false;
    }
    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    if (validateRequest(items, addresses)) {
      try {
        await axios.post(
          `${config.endpoint}/cart/checkout`,
          { addressId: addresses.selected },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        enqueueSnackbar("Order placed successfully!", { variant: "success" });
        const cartData = await fetchCart(token);
        generateCartItemsFrom(cartData, products);
        history.push("/thanks");
      } catch (e) {
        if (e.response) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not place order. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        // const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartData);
      }

      await getAddresses(token);
    };

    if (token) {
      onLoadHandler();
    } else {
      enqueueSnackbar("You must be logged in to access checkout page", {
        variant: "info",
      });
      history.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {addresses.all.length === 0 ? (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to
                  proceed.
                </Typography>
              ) : (
                addresses.all.map((address) => (
                  <Box
                    key={address._id}
                    className={`address-item ${
                      addresses.selected === address._id ? "selected" : ""
                    }`}
                    onClick={() =>
                      setAddresses({ ...addresses, selected: address._id })
                    }
                  >
                    <Typography>{address.address}</Typography>
                    <Button
                      startIcon={<Delete />}
                      onClick={() => deleteAddress(token, address._id)}
                    >
                      DELETE
                    </Button>
                  </Box>
                ))
              )}
            </Box>

            {newAddress.isAddingNewAddress ? (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            ) : (
              <Button
                variant="contained"
                onClick={() =>
                  setNewAddress({ ...newAddress, isAddingNewAddress: true })
                }
              >
                Add new address
              </Button>
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
        <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;