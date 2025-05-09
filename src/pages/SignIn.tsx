import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonButton, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonButtons,
  IonBackButton,
  IonLoading,
  IonText
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router';
import '../theme/custom.scss';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      history.push('/tab1'); // Redirect to home after login
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab2" />
          </IonButtons>
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Signing in..." />
        
        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}
        
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput 
              type="email" 
              value={email} 
              onIonChange={e => setEmail(e.detail.value || '')} 
              required
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput 
              type="password" 
              value={password} 
              onIonChange={e => setPassword(e.detail.value || '')} 
              required
            />
          </IonItem>
          
          <div className="ion-padding-top">
            <IonButton 
              expand="block" 
              type="submit" 
              className="primary-button signin-button"
              disabled={loading}
            >
              Sign In
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default SignIn;