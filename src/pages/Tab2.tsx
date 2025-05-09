
import React from 'react';
import { IonContent, IonPage, IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import '../theme/custom.scss';
import './Tab2.css';

const Tab2: React.FC = () => {
  const router = useIonRouter();

  const navigateBack = () => {
    router.push('/tab1');
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="back-button-container">
          <IonButton fill="clear" onClick={navigateBack}>
            <IonIcon slot="icon-only" icon={arrowBack} />
          </IonButton>
        </div>
        <div className="center-content auth-container">
          <h1 className="greeting-text">Hola!</h1>
          <div className="auth-buttons">
            <IonButton 
              className="primary-button signin-button" 
              onClick={handleSignIn}
            >
              Sign In
            </IonButton>
            <div className="separator">OR</div>
            <IonButton 
              className="primary-button signup-button" 
              onClick={handleSignUp}
            >
              Sign Up
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
