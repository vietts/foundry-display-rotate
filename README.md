# Display Rotate per Foundry VTT

Per chi mostra la mappa su uno schermo da tavolo (TV o monitor sdraiato) con un utente Foundry dedicato, per esempio con **Monk's Common Display**.

Molte mappe sono verticali e su uno schermo orizzontale restano piccole. Questo modulo ruota di 90° la vista **solo sul client del display**, quando la scena girata ci sta più grande. Le coordinate della scena non cambiano: il GM, i giocatori e i moduli che muovono i token (per esempio Phone Companion) continuano a vedere la scena com'è.

> **Beta.** Provato su Foundry 14 con Monk's Common Display, browser Chromium, schermo 16:9. Segnala i problemi nelle [Issues](https://github.com/vietts/foundry-display-rotate/issues).

## Installazione

In Foundry: *Moduli aggiuntivi → Installa modulo*, incolla nel campo **URL del manifest**:

```
https://github.com/vietts/foundry-display-rotate/releases/latest/download/module.json
```

Poi attiva **Display Rotate** in *Gestisci moduli* nel mondo dove ti serve. Gli aggiornamenti arrivano da Foundry come per gli altri moduli.

## Uso

1. Crea (o scegli) l'utente che mostra la mappa sul display e scrivi il suo nome in *Impostazioni dei moduli → Display Rotate → Utente display* (default: `Tester`).
2. Apri Foundry sul display con quell'utente. Quando attivi una scena verticale, la vista si gira da sola.
3. Se il verso è sbagliato per come siete seduti, cambia *Verso della rotazione*.

### Impostazioni

| Impostazione | Cosa fa |
|---|---|
| Utente display | Nome dell'utente il cui client viene ruotato. Tutti gli altri non vedono differenze. |
| Verso della rotazione | Orario (+90°) o antiorario (−90°) per le scene verticali. |
| Soglia | Gira solo se la scena girata viene più grande almeno di questo fattore (1,1 = +10%). Evita di girare le mappe quasi quadrate. |

### Forzare la rotazione di una scena

In *Configura scena → Base* c'è il campo **Rotazione display**: Automatica, Dritta, Orario, Antiorario o Capovolta (180°). Vale solo per il display.

## Audio senza clic

Foundry tiene l'audio bloccato finché qualcuno non clicca sulla pagina, e sul display nessuno clicca. Se il browser del display permette l'autoplay, il modulo sblocca l'audio da solo. Con Chrome o un browser Chromium basta aprirlo con:

```
--autoplay-policy=no-user-gesture-required
```

Senza quel flag l'audio parte al primo clic, come al solito.

## Limiti

- Il display è passivo: con la vista girata i clic sul canvas non finiscono nel punto giusto.
- Solo Foundry 14.

## Licenza

MIT.
