import mongoose from "mongoose";

const MaternalRecordSchema=new mongoose.Schema({

    motherID: { 
        type: mongoose.Types.ObjectId,
         ref: "User", 
         required: true 
        },

     pregnancy: { 
        lmpDate: Date, // last menstrual period
        edd: Date,      // expected delivery date
        parity: Number,  //Number of times a woman has given birth
        riskFlags: [{ type: String }] // e.g., "pre-eclampsia-risk"
     },

     visits: [{ 
        date: Date,
        gestationalWeek: Number,  //ANC visits at 12, 20, 26 weeks
        bp: String, 
        weightKg: Number, 
        notes: String,
        providerID: { 
          type: mongoose.Types.ObjectId,
           ref: "User"
         }
     }],

     postpartum: [{ 
        date: Date, 
        breastfeedingStatus: String,
        moodScreen: {   //mental health screening.
            score: Number, 
            tool: String
        }
        
    }]
},{timestamps:true})


export const MaternalRecord = mongoose.model("MaternalRecord",MaternalRecordSchema)