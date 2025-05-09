import React from 'react';
import { IonContent, IonPage, IonButton, useIonRouter } from '@ionic/react';
import Logo from '../components/Logo';
import '../theme/custom.scss';
import './Tab1.css';

const Tab1: React.FC = () => {
  const router = useIonRouter();

  const handleStart = () => {
    // Navigate to Tab2 (auth screen)
    router.push('/tab2');
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="center-content welcome-container">
          <div className="logo-container">
            <Logo size="medium" />
          </div>
          <h2 className="welcome-text">Empecemos</h2>
          <IonButton 
            className="primary-button" 
            onClick={handleStart}
          >
            Continuar →
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;