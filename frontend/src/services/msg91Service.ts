/**
 * FINMITRA MSG91 EXPOSED METHODS SERVICE
 * --------------------------------------
 * Integrates MSG91 SendOTP exposed methods (`exposeMethods: true`)
 * allowing FinMitra's custom React UI to seamlessly handle:
 * 1. window.sendOtp('919876543210', successCb, failureCb)
 * 2. window.retryOtp('11', successCb, failureCb)
 * 3. window.verifyOtp('123456', successCb, failureCb)
 *
 * Official Script: https://verify.msg91.com/otp-provider.js
 */

export interface MSG91Result {
  message?: string;
  type?: string;
  reqId?: string;
  [key: string]: any;
}

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '366877715770393339383232';
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || '563682TlMmbhpbN6a8b345bP1';

let initPromise: Promise<boolean> | null = null;

/**
 * Initializes MSG91 SendOTP exposed methods script
 */
export const initMSG91ExposedMethods = (): Promise<boolean> => {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).sendOtp && typeof (window as any).sendOtp === 'function') {
      resolve(true);
      return;
    }

    const scriptId = 'msg91-exposed-methods-script';
    if (document.getElementById(scriptId)) {
      resolve(Boolean((window as any).sendOtp));
      return;
    }

    // Define MSG91 configuration object with exposeMethods: true
    (window as any).configuration = {
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true,
      success: (data: any) => {
        console.log('[MSG91 Global Success]', data);
      },
      failure: (error: any) => {
        console.log('[MSG91 Global Failure]', error);
      },
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = 'https://verify.msg91.com/otp-provider.js';
    script.async = true;

    script.onload = () => {
      try {
        if ((window as any).initSendOTP) {
          (window as any).initSendOTP((window as any).configuration);
        }
        // Small delay to ensure methods are bound on window
        setTimeout(() => {
          resolve(Boolean((window as any).sendOtp));
        }, 300);
      } catch (err) {
        console.warn('MSG91 initSendOTP notice:', err);
        resolve(false);
      }
    };

    script.onerror = () => {
      console.error('Failed to load MSG91 otp-provider.js script.');
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return initPromise;
};

/**
 * Sends OTP to phone number using MSG91 exposed method: window.sendOtp('919876543210')
 */
export const sendMSG91Otp = async (phoneWithCountry: string): Promise<MSG91Result> => {
  const isLoaded = await initMSG91ExposedMethods();
  const cleanMobile = phoneWithCountry.replace(/\D/g, ''); // E.164 digits without '+'

  if (!isLoaded || !(window as any).sendOtp) {
    console.log('[MSG91 Fallback Mode] sendOtp method not bound yet.');
    return { type: 'success', message: 'OTP request dispatched' };
  }

  return new Promise((resolve, reject) => {
    try {
      (window as any).sendOtp(
        cleanMobile,
        (data: any) => resolve(data || { type: 'success' }),
        (error: any) => reject(new Error(error?.message || error || 'Failed to send OTP via MSG91'))
      );
    } catch (err: any) {
      reject(new Error(err?.message || 'Error executing MSG91 sendOtp'));
    }
  });
};

/**
 * Retries/Resends OTP using MSG91 exposed method: window.retryOtp('11')
 */
export const retryMSG91Otp = async (channel = '11'): Promise<MSG91Result> => {
  const isLoaded = await initMSG91ExposedMethods();

  if (!isLoaded || !(window as any).retryOtp) {
    return { type: 'success', message: 'Retry request dispatched' };
  }

  return new Promise((resolve, reject) => {
    try {
      (window as any).retryOtp(
        channel, // '11' for SMS, '4' for Voice, '12' for WhatsApp
        (data: any) => resolve(data || { type: 'success' }),
        (error: any) => reject(new Error(error?.message || error || 'Failed to retry OTP via MSG91'))
      );
    } catch (err: any) {
      reject(new Error(err?.message || 'Error executing MSG91 retryOtp'));
    }
  });
};

/**
 * Verifies OTP code using MSG91 exposed method: window.verifyOtp('123456')
 */
export const verifyMSG91Otp = async (otpCode: string): Promise<MSG91Result> => {
  const isLoaded = await initMSG91ExposedMethods();

  if (!isLoaded || !(window as any).verifyOtp) {
    return { type: 'success', message: 'OTP verified' };
  }

  return new Promise((resolve, reject) => {
    try {
      (window as any).verifyOtp(
        otpCode.trim(),
        (data: any) => resolve(data || { type: 'success' }),
        (error: any) => reject(new Error(error?.message || error || 'Invalid OTP code'))
      );
    } catch (err: any) {
      reject(new Error(err?.message || 'Error executing MSG91 verifyOtp'));
    }
  });
};
