import { alertController } from '@ionic/vue';

export function useConfirm() {
  const presentConfirm = async (options: {
    header: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header: options.header,
        message: options.message,
        buttons: [
          {
            text: options.cancelText || 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: options.confirmText || 'Confirm',
            handler: () => resolve(true),
          },
        ],
      });

      await alert.present();
    });
  };

  return { presentConfirm };
}