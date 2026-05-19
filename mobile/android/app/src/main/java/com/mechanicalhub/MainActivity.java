package com.mechanicalhub;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.Manifest;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar topProgress;
    private FrameLayout rootLayout;
    private LinearLayout splashView;
    private LinearLayout errorView;
    private boolean splashDismissed = false;

    private static final String APP_URL = "https://servora.vercel.app";
    private static final String BRAND_COLOR = "#003366";
    private static final String BG_COLOR = "#F5F7FA";
    private static final int LOCATION_PERMISSION_REQUEST = 1001;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor(BRAND_COLOR));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.setNavigationBarColor(Color.WHITE);
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }

        rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor(BG_COLOR));

        // === WebView ===
        webView = new WebView(this);
        webView.setVisibility(View.INVISIBLE);
        FrameLayout.LayoutParams wParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT);
        webView.setLayoutParams(wParams);
        webView.setBackgroundColor(Color.parseColor(BG_COLOR));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " ServoraApp/1.0");

        // Cookies
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // External links: tel, mailto, whatsapp, maps
                if (url.startsWith("tel:") || url.startsWith("mailto:") ||
                    url.startsWith("whatsapp:") || url.startsWith("geo:") ||
                    url.startsWith("google.navigation:")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    } catch (Exception ignored) {}
                    return true;
                }
                // Keep internal URLs in WebView
                if (url.contains("servora.vercel.app") ||
                    url.contains("catalysiscongress.com")) {
                    return false;
                }
                // Open external URLs in browser
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                topProgress.setVisibility(View.VISIBLE);
                errorView.setVisibility(View.GONE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                topProgress.setVisibility(View.GONE);
                // Inject mobile optimizations
                view.evaluateJavascript(
                    "(function(){" +
                    "var m=document.querySelector('meta[name=viewport]');" +
                    "if(m)m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no');" +
                    "document.body.style.overscrollBehavior='none';" +
                    "document.documentElement.style.webkitTapHighlightColor='transparent';" +
                    // Smooth scroll behavior
                    "document.documentElement.style.scrollBehavior='smooth';" +
                    "})()", null);

                // Dismiss splash with fade
                if (!splashDismissed) {
                    splashDismissed = true;
                    webView.setVisibility(View.VISIBLE);
                    AlphaAnimation fadeOut = new AlphaAnimation(1f, 0f);
                    fadeOut.setDuration(400);
                    fadeOut.setFillAfter(true);
                    splashView.startAnimation(fadeOut);
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        splashView.setVisibility(View.GONE);
                    }, 400);
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    topProgress.setVisibility(View.GONE);
                    showError();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                topProgress.setProgress(newProgress);
                if (newProgress >= 100) topProgress.setVisibility(View.GONE);
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback callback) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    requestPermissions(
                            new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                                         Manifest.permission.ACCESS_COARSE_LOCATION},
                            LOCATION_PERMISSION_REQUEST);
                }
            }
        });

        // === Top Progress Bar ===
        topProgress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        topProgress.setIndeterminate(false);
        topProgress.setMax(100);
        topProgress.setScaleY(1.2f);
        topProgress.setVisibility(View.GONE);
        FrameLayout.LayoutParams pParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, dp(3));
        topProgress.setLayoutParams(pParams);

        // === Splash Screen ===
        splashView = buildSplash();

        // === Error View ===
        errorView = buildErrorView();
        errorView.setVisibility(View.GONE);

        rootLayout.addView(webView);
        rootLayout.addView(topProgress);
        rootLayout.addView(splashView);
        rootLayout.addView(errorView);

        setContentView(rootLayout);

        if (isNetworkAvailable()) {
            webView.loadUrl(APP_URL);
        } else {
            showError();
        }
    }

    private LinearLayout buildSplash() {
        LinearLayout splash = new LinearLayout(this);
        splash.setOrientation(LinearLayout.VERTICAL);
        splash.setGravity(Gravity.CENTER);
        splash.setBackgroundColor(Color.parseColor(BRAND_COLOR));
        splash.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        // Logo "S"
        TextView logo = new TextView(this);
        logo.setText("S");
        logo.setTextColor(Color.WHITE);
        logo.setTextSize(72);
        logo.setTypeface(null, android.graphics.Typeface.BOLD);
        logo.setGravity(Gravity.CENTER);
        logo.setWidth(dp(120));
        logo.setHeight(dp(120));
        logo.setBackground(buildRoundedBg("#004488", dp(24)));
        splash.addView(logo);

        // App name
        TextView name = new TextView(this);
        name.setText("Servora");
        name.setTextColor(Color.WHITE);
        name.setTextSize(24);
        name.setTypeface(null, android.graphics.Typeface.BOLD);
        name.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams np = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        np.topMargin = dp(20);
        name.setLayoutParams(np);
        splash.addView(name);

        // Tagline
        TextView tag = new TextView(this);
        tag.setText("Find Best Home Services Near You");
        tag.setTextColor(Color.parseColor("#99BBDD"));
        tag.setTextSize(13);
        tag.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        tp.topMargin = dp(8);
        tag.setLayoutParams(tp);
        splash.addView(tag);

        // Loading spinner
        ProgressBar spinner = new ProgressBar(this);
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(dp(36), dp(36));
        sp.topMargin = dp(40);
        spinner.setLayoutParams(sp);
        splash.addView(spinner);

        return splash;
    }

    private LinearLayout buildErrorView() {
        LinearLayout error = new LinearLayout(this);
        error.setOrientation(LinearLayout.VERTICAL);
        error.setGravity(Gravity.CENTER);
        error.setBackgroundColor(Color.parseColor(BG_COLOR));
        error.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        // Icon
        TextView icon = new TextView(this);
        icon.setText("📡");
        icon.setTextSize(48);
        icon.setGravity(Gravity.CENTER);
        error.addView(icon);

        // Title
        TextView title = new TextView(this);
        title.setText("No Internet Connection");
        title.setTextColor(Color.parseColor("#333333"));
        title.setTextSize(20);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleP = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        titleP.topMargin = dp(16);
        title.setLayoutParams(titleP);
        error.addView(title);

        // Message
        TextView msg = new TextView(this);
        msg.setText("Please check your connection and try again");
        msg.setTextColor(Color.parseColor("#888888"));
        msg.setTextSize(14);
        msg.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams msgP = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        msgP.topMargin = dp(8);
        msg.setLayoutParams(msgP);
        error.addView(msg);

        // Retry button
        TextView retry = new TextView(this);
        retry.setText("Retry");
        retry.setTextColor(Color.WHITE);
        retry.setTextSize(16);
        retry.setTypeface(null, android.graphics.Typeface.BOLD);
        retry.setGravity(Gravity.CENTER);
        retry.setPadding(dp(32), dp(14), dp(32), dp(14));
        retry.setBackground(buildRoundedBg(BRAND_COLOR, dp(12)));
        LinearLayout.LayoutParams retryP = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        retryP.topMargin = dp(28);
        retry.setLayoutParams(retryP);
        retry.setOnClickListener(v -> {
            if (isNetworkAvailable()) {
                errorView.setVisibility(View.GONE);
                splashView.setVisibility(View.VISIBLE);
                splashDismissed = false;
                webView.loadUrl(APP_URL);
            }
        });
        error.addView(retry);

        return error;
    }

    private void showError() {
        splashView.setVisibility(View.GONE);
        webView.setVisibility(View.INVISIBLE);
        errorView.setVisibility(View.VISIBLE);
    }

    private android.graphics.drawable.GradientDrawable buildRoundedBg(String color, int radius) {
        android.graphics.drawable.GradientDrawable gd = new android.graphics.drawable.GradientDrawable();
        gd.setColor(Color.parseColor(color));
        gd.setCornerRadius(radius);
        return gd;
    }

    private int dp(int val) {
        return (int) (val * getResources().getDisplayMetrics().density);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni != null && ni.isConnectedOrConnecting();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                webView.reload();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
