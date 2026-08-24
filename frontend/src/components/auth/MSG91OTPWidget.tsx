import React, { useEffect, useState } from 'react';

/**
 * MSG91 Official SendOTP Widget & React Native Component Spec Integration
 * ------------------------------------------------------------------------
 * Widget ID: 366877715770393339383232
 * Auth Token: 563682TlMmbhpbN6a8b345bP1
 */

interface MSG91OTPWidgetProps {
  visible: boolean;
  widgetId?: string;
  tokenAuth?: string;
  onClose: () => void;
  onCompletion: (result: { success: boolean; message?: string; identifier?: string }) => void;
}

export const MSG91OTPWidget: React.FC<MSG91OTPWidgetProps> = ({
  visible,
  widgetId = import.meta.env.VITE_MSG91_WIDGET_ID || "366877715770393339383232",
  tokenAuth = import.meta.env.VITE_MSG91_TOKEN_AUTH || "563682TlMmbhpbN6a8b345bP1",
  onClose,
  onCompletion,
}) => {
  const [, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Load MSG91 Web Widget Script dynamically if not already loaded
    const scriptId = 'msg91-otp-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://control.msg91.com/app/assets/otp-provider/otp-provider.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        initWidget();
      };
      script.onerror = () => {
        console.error('Failed to load MSG91 SendOTP Widget script.');
      };
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
      initWidget();
    }

    function initWidget() {
      if ((window as any).sendOtp) {
        try {
          (window as any).sendOtp({
            widgetId,
            tokenAuth,
            onSuccess: (data: any) => {
              onCompletion({
                success: true,
                message: data?.accessToken || data?.message || 'Verification successful',
                identifier: data?.identifier || data?.mobile,
              });
            },
            onFailure: (err: any) => {
              onCompletion({
                success: false,
                message: err?.message || 'Verification failed',
              });
            },
            onClose: () => {
              onClose();
            },
          });
        } catch (e) {
          console.warn('MSG91 Widget initialization notice:', e);
        }
      }
    }
  }, [visible, widgetId, tokenAuth, onClose, onCompletion]);

  if (!visible) return null;

  return (
    <div style={{ display: 'none' }} id="msg91-otp-container" />
  );
};

export default MSG91OTPWidget;
