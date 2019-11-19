/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//Standard RN
#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

//REACT_NATIVE_BRANCH
#import <react-native-branch/RNBranch.h>

//REACT_NATIVE_FABRIC
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>

//REACT_NATIVE_FIREBASE
#import <Firebase.h>

//REACT_NATIVE_NAVIGATION
#import <ReactNativeNavigation/ReactNativeNavigation.h>

#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <FBSDKLoginKit/FBSDKLoginKit.h>
#import "RNGoogleSignin.h"
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  //REACT_NATIVE_BRANCH
  // Uncomment this line to use the test key instead of the live one.
  [RNBranch useTestInstance];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES]; // <-- add this

  //REACT_NATIVE_FABRIC
 // [Fabric with:@[[Crashlytics class]]];

  //REACT_NATIVE_FUREBASE
  [FIRApp configure];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  //REACT_NATIVE_NAVIGATION
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [ReactNativeNavigation bootstrap:[self sourceURLForBridge: bridge] launchOptions:launchOptions];

  for (NSString* family in [UIFont familyNames])
  {
    NSLog(@"%@", family);
    for (NSString* name in [UIFont fontNamesForFamilyName: family])
    {
      NSLog(@" %@", name);
    }
  }
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

  
  // Facebook/Google/Branch.io URL handling
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
  
  if ([RNBranch.branch application:application openURL:url sourceApplication:sourceApplication annotation:annotation]) {
    return YES;
  }
  
  if ([RNGoogleSignin application:application
                          openURL:url
                sourceApplication:sourceApplication
                       annotation:annotation
       ]) {
    return YES;
  }
  if ([[FBSDKApplicationDelegate sharedInstance] application:application
                                                     openURL:url
                                           sourceApplication:sourceApplication
                                                  annotation:annotation
       ]) {
    return YES;
  }
    
  return [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *restorableObjects))restorationHandler {
  return [RNBranch continueUserActivity:userActivity];
}

- (void)applicationWillResignActive:(UIApplication *)application {
  UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
  UIVisualEffectView *blurEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
  NSArray *allWindows = [[UIApplication sharedApplication] windows];
  for (UIWindow * aWindow in allWindows) {
    blurEffectView.frame = aWindow.frame;
    blurEffectView.tag = 4444;
    [aWindow addSubview:blurEffectView];
  }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  NSArray *allWindows = [[UIApplication sharedApplication] windows];
  for (UIWindow * aWindow in allWindows) {
    UIView *blurEffectView = [aWindow viewWithTag:4444];
    if (blurEffectView){
      [blurEffectView removeFromSuperview];
    }
  }
}
  
@end
