
//STANDARD REACT_NATIVE STUFF
package com.solidstategroup.wazoku;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

// Keep this here for 'react-native link'
import com.facebook.react.ReactApplication;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.oblador.keychain.KeychainPackage;
import rnpbkdf2.PBKDF2Package;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.shell.MainReactPackage;
import com.reactlibrary.RNThreadPackage;
import com.github.dryganets.adapter.cipher.SqliteCipherConnectionProvider;
import org.pgsqlite.SQLitePluginPackage;
import ui.photoeditor.RNPhotoEditorPackage;
import com.imagepicker.ImagePickerPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.vinzscam.reactnativefileviewer.RNFileViewerPackage;
import net.zubricky.AndroidKeyboardAdjust.AndroidKeyboardAdjustPackage;
import com.rnfs.RNFSPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.magus.fblogin.FacebookLoginPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.clipsub.rnbottomsheet.RNBottomSheetPackage;
import com.wix.interactable.Interactable;
import co.apptailor.googlesignin.RNGoogleSigninPackage;  // <--- import

//REAT_NATIVE_NAVIGATION
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationPackage;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import android.support.annotation.Nullable;

//REACT_NATIVE_BRANCH
import io.branch.rnbranch.RNBranchPackage;
import io.branch.rnbranch.RNBranchModule;

//REACT_NATIVE_CRASHLYTICS
import com.smixx.fabric.FabricPackage;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

//REACT_NATIVE_FIREBASE
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // <-- Add this line
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage; // <-- Add this line

import com.oblador.vectoricons.VectorIconsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;

//REACT_NATIVE_LOTTIE
import com.airbnb.android.react.lottie.LottiePackage;

//VECTOR_ICONS
import com.oblador.vectoricons.VectorIconsPackage;

//REACT_NATIVE_DEVICE_INFO
import com.learnium.RNDeviceInfo.RNDeviceInfo;

//REACT_NATIVE_VIEW_OVERFLOW
import com.entria.views.RNViewOverflowPackage;

//REACT_NATIVE_SVG
import com.horcrux.svg.SvgPackage;

import android.webkit.WebView;

public class MainApplication extends NavigationApplication {

    @Override
    public boolean isDebug() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected ReactGateway createReactGateway() {
        return new ReactGateway(this, isDebug(), mReactNativeHost);
    }

    // No longer used as we are creating a custom ReactNativeHost but must be implemented
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return Arrays.<ReactPackage>asList();
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new ReactNativeLocalizationPackage(),
                new KeychainPackage(),
                new PBKDF2Package(),
                new RNTextSizePackage(),
                new PickerPackage(),
                new NavigationPackage(mReactNativeHost),
                new RNThreadPackage(mReactNativeHost),
                new SQLitePluginPackage(new SqliteCipherConnectionProvider(getApplicationContext())),
                new RNPhotoEditorPackage(),
                new ImagePickerPackage(),
                new FastImageViewPackage(),
                new RNFileViewerPackage(),
                new AndroidKeyboardAdjustPackage(),
                new RNFSPackage(),
                new DocumentPickerPackage(),
                new RNBottomSheetPackage(),
                new Interactable(),

                //REACT_NATIVE_FIRE_BASE
                new RNFirebasePackage(),
                new RNFirebaseMessagingPackage(),
                new RNFirebaseAnalyticsPackage(),
                new RNFirebaseNotificationsPackage(),
                //END OF REACT_NATIVE_FIRE_BASE

                new FabricPackage(),
                new LottiePackage(),
                new VectorIconsPackage(),
                new RNDeviceInfo(),
                new RNBranchPackage(),
                new FacebookLoginPackage(),
                new SvgPackage(),
                new RNGoogleSigninPackage(),
                new LinearGradientPackage(),
                new RNViewOverflowPackage(),
                new AsyncStoragePackage(),
                new NetInfoPackage(),
                new RNCWebViewPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    String getJSMainModuleName() { return "index"; }

    @Override
    public void onCreate() {
        super.onCreate();
        RNBranchModule.getAutoInstance(this);
        WebView.setWebContentsDebuggingEnabled(false);
    }

}
