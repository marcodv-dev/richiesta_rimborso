import bcrypt from 'bcryptjs';
import pool from './config/database';

const seed = async () => {
  try {
    console.log('Inizializzazione del database...');

    await pool.execute('DROP TABLE IF EXISTS richiestarimborso');
    await pool.execute('DROP TABLE IF EXISTS categoriaspesa');
    await pool.execute('DROP TABLE IF EXISTS utenti');

    await pool.execute(`
      CREATE TABLE utenti (
        UtenteID INT AUTO_INCREMENT PRIMARY KEY,
        Nome VARCHAR(100) NOT NULL,
        Cognome VARCHAR(100) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Ruolo VARCHAR(50) NOT NULL DEFAULT 'dipendente'
      )
    `);

    await pool.execute(`
      CREATE TABLE categoriaspesa (
        CategoriaID INT AUTO_INCREMENT PRIMARY KEY,
        Descrizione VARCHAR(255) NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE richiestarimborso (
        RichiestaID INT AUTO_INCREMENT PRIMARY KEY,
        DataInserimento DATETIME DEFAULT CURRENT_TIMESTAMP,
        DataSpesa DATE NOT NULL,
        CategoriaID INT NOT NULL,
        Importo DECIMAL(10,2) NOT NULL,
        Descrizione TEXT NOT NULL,
        RiferimentoGiustificativo VARCHAR(255),
        Stato VARCHAR(50) NOT NULL DEFAULT 'In attesa',
        DipendenteID INT NOT NULL,
        DataValutazione DATE,
        ResponsabileValutazioneID INT,
        MotivazioneRifiuto TEXT,
        DataLiquidazione DATE,
        FOREIGN KEY (CategoriaID) REFERENCES categoriaspesa(CategoriaID),
        FOREIGN KEY (DipendenteID) REFERENCES utenti(UtenteID),
        FOREIGN KEY (ResponsabileValutazioneID) REFERENCES utenti(UtenteID)
      )
    `);

    console.log('Tabelle create con successo');

    const password = await bcrypt.hash('password123', 10);

    await pool.execute(
      'INSERT INTO utenti (Nome, Cognome, Email, Password, Ruolo) VALUES (?, ?, ?, ?, ?)',
      ['Mario', 'Rossi', 'mario.rossi@azienda.com', password, 'dipendente']
    );
    await pool.execute(
      'INSERT INTO utenti (Nome, Cognome, Email, Password, Ruolo) VALUES (?, ?, ?, ?, ?)',
      ['Laura', 'Bianchi', 'laura.bianchi@azienda.com', password, 'responsabile_amministrativo']
    );
    await pool.execute(
      'INSERT INTO utenti (Nome, Cognome, Email, Password, Ruolo) VALUES (?, ?, ?, ?, ?)',
      ['Giuseppe', 'Verdi', 'giuseppe.verdi@azienda.com', password, 'dipendente']
    );

    console.log('Utenti inseriti con successo');

    await pool.execute(
      'INSERT INTO categoriaspesa (Descrizione) VALUES (?)',
      ['Trasferta']
    );
    await pool.execute(
      'INSERT INTO categoriaspesa (Descrizione) VALUES (?)',
      ['Pasto']
    );
    await pool.execute(
      'INSERT INTO categoriaspesa (Descrizione) VALUES (?)',
      ['Pedaggio']
    );
    await pool.execute(
      'INSERT INTO categoriaspesa (Descrizione) VALUES (?)',
      ['Parcheggio']
    );
    await pool.execute(
      'INSERT INTO categoriaspesa (Descrizione) VALUES (?)',
      ['Acquisto autorizzato']
    );

    console.log('Categorie inserite con successo');

    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID, DataValutazione, ResponsabileValutazioneID, DataLiquidazione)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-05-10', 1, 120.50, 'Trasferta a Milano per incontro con cliente', 'Approvata', 1, '2026-05-12', 2, '2026-05-15']
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID, DataValutazione, ResponsabileValutazioneID, MotivazioneRifiuto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-05-14', 2, 35.00, 'Pranzo di lavoro con fornitori', 'Rifiutata', 1, '2026-05-16', 2, 'Giustificativo non valido']
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['2026-05-20', 3, 15.80, 'Pedaggio autostrada A1', 'In attesa', 1]
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID, DataValutazione, ResponsabileValutazioneID, DataLiquidazione)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-06-05', 1, 250.00, 'Trasferta a Roma per fiera di settore', 'Liquidata', 1, '2026-06-08', 2, '2026-06-12']
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['2026-06-15', 4, 8.50, 'Parcheggio stazione Centrale', 'In attesa', 3]
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID, DataValutazione, ResponsabileValutazioneID, DataLiquidazione)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-06-18', 5, 45.00, 'Acquisto materiale di cancelleria urgente', 'Approvata', 3, '2026-06-20', 2, null]
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, RiferimentoGiustificativo, Stato, DipendenteID)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['2026-07-01', 2, 22.50, 'Pranzo durante trasferta a Torino', 'scontrino_001.pdf', 'In attesa', 3]
    );
    await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, Stato, DipendenteID, DataValutazione, ResponsabileValutazioneID, DataLiquidazione)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-05-22', 4, 12.00, 'Parcheggio aeroporto Linate', 'Liquidata', 3, '2026-05-25', 2, '2026-05-28']
    );

    console.log('Richieste inserite con successo');

    console.log('Seed completato!');
    console.log('---');
    console.log('Utenti creati (password: password123):');
    console.log('  - mario.rossi@azienda.com (dipendente)');
    console.log('  - giuseppe.verdi@azienda.com (dipendente)');
    console.log('  - laura.bianchi@azienda.com (responsabile_amministrativo)');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
