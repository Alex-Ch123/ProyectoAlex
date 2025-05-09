
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

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword || !name) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, name);
      history.push('/tab1'); // Redirect to home after registration
    } catch (err) {
      setError('Failed to create an account');
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
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Creating account..." />
        
        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}
        
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Name</IonLabel>
            <IonInput 
              value={name} 
              onIonChange={e => setName(e.detail.value || '')} 
              required
            />
          </IonItem>
          
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
          
          <IonItem>
            <IonLabel position="floating">Confirm Password</IonLabel>
            <IonInput 
              type="password" 
              value={confirmPassword} 
              onIonChange={e => setConfirmPassword(e.detail.value || '')} 
              required
            />
          </IonItem>
          
          <div className="ion-padding-top">
            <IonButton 
              expand="block" 
              type="submit" 
              className="primary-button signup-button"
              disabled={loading}
            >
              Create Account
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default SignUp;