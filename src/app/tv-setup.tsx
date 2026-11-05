import { Redirect } from 'expo-router';

/** Endereço antigo da personalização da TV: agora fica na tela Coach. */
export default function TvSetupRedirect() {
  return <Redirect href="/coach" />;
}
