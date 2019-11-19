package com.solidstategroup.wazoku;

import com.reactnativenavigation.NavigationActivity;
import io.branch.rnbranch.*; // <-- add this
import android.content.Intent; // <-- and this
import android.os.Bundle;
import android.view.WindowManager;

public class MainActivity extends NavigationActivity {
    @Override
    protected void onStart() {
        super.onStart();
        RNBranchModule.initSession(getIntent().getData(), this);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    }
}
