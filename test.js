const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://YOUR_NEW_USERNAME:YOUR_NEW_PASSWORD@cluster0.mclyp3i.mongodb.net/zikhali-rev?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected!");
    process.exit();
  })
  .catch((err) => {
    console.log(err);
  });

```

  balance: Double('1177.7800000000002'),
  deposits: NumberInt('1000'),
  withdrawals: Double('0'),
  profits: Double('177.78'),
  losses: Double('0'),
  createdAt: ISODate('2026-06-11T18:08:09.237Z'),
  updatedAt: ISODate('2026-09-12T07:35:05.901Z'),
  __v: NumberInt('0')
```
