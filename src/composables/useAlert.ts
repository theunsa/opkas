import { alertController } from '@ionic/vue';

export function useAlert() {
  const presentAlert = async (options: {
    header: string;
    subHeader?: string;
    message: string;
    buttons?: (string | { text: string; handler: () => void })[];
  }) => {
    const alert = await alertController.create({
      header: options.header,
      subHeader: options.subHeader,
      message: options.message,
      buttons: options.buttons || ['OK'],
    });

    await alert.present();

    return alert;
  };

  return { presentAlert };
}