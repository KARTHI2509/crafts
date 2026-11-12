import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CompareProvider } from "./components/ProductCompare";
import { WishlistProvider } from "./components/Wishlist";
import { RecentlyViewedProvider } from "./components/RecentlyViewed";
import { CouponProvider } from "./components/CouponCode";
import { GiftWrapProvider } from "./components/GiftWrap";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RecentlyViewedProvider>
              <WishlistProvider>
                <CouponProvider>
                  <GiftWrapProvider>
                    <CompareProvider>
                      <App />
                    </CompareProvider>
                  </GiftWrapProvider>
                </CouponProvider>
              </WishlistProvider>
            </RecentlyViewedProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
