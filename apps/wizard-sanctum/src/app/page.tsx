import Image from "next/image";

'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class WizardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WizardScene' });
  }

  preload() {
    // Load a simple wizard sprite (placeholder - replace with real asset)
    this.load.image('wizard', 'https://labs.phaser.io/assets/sprites/wizard.png'); // Placeholder from Phaser examples
  }

  create() {
    // Add background (simple room)
    this.add.rectangle(400, 300, 800, 600, 0x000000); // Black background for 'Wizard Office'
    this.add.text(10, 10, 'Wizard Office', { fontSize: '24px', fill: '#fff' });

    // Add wizard sprite
    this.wizard = this.physics.add.sprite(400, 300, 'wizard');
    this.wizard.setCollideWorldBounds(true);

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch controls (for mobile)
    this.input.addPointer(1); // Enable touch
  }

  update() {
    // Movement logic
    if (this.cursors.left.isDown) {
      this.wizard.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.wizard.setVelocityX(160);
    } else {
      this.wizard.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.wizard.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.wizard.setVelocityY(160);
    } else {
      this.wizard.setVelocityY(0);
    }

    // Touch movement (point to move)
    if (this.input.activePointer.isDown) {
      this.physics.moveToObject(this.wizard, this.input.activePointer, 160);
    }
  }
}

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: '100%',
        height: '100%',
        parent: gameRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
          },
        },
        scene: [WizardScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      const game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Wizard's Sanctum</h1>
      <div ref={gameRef} className="w-full h-[80vh] border border-gray-300" />
    </div>
  );
}

