const connectMongo = require("../configs/mongo");


// ذخیره بازدید
async function createVisit(data) {

    const db = await connectMongo();

    const visits = db.collection("visit");


    const result = await visits.insertOne(data);

    return result;

}



// گرفتن اطلاعات چارت
async function getChart(range) {

    const db = await connectMongo();

    const visits = db.collection("visit");


    let format;





    if (range === "daily") {

        format = "%H";

    }

    else if (range === "weekly") {

        format = "%Y-%m-%d";

    }

    else if (range === "monthly") {

        format = "%d";

    }

    else if (range === "yearly") {

        format = "%m";

    }




    const data = await visits.aggregate([

        {
            $group: {
                _id: {
                    $dateToString: {
                        format: format,
                        date: "$visitTime"
                    }
                },

                count: {
                    $sum: 1
                }
            }
        },

        {
            $sort: {
                _id: 1
            }
        }

    ]).toArray();



    return {

        labels: data.map(item => item._id),

        data: data.map(item => item.count)

    };

}


async function getStats() {

    const db = await connectMongo();

    const visits = db.collection("visit");


    const now = new Date();


    const startToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );


    const startWeek = new Date();
    startWeek.setDate(now.getDate() - 7);


    const startMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );


    const startYear = new Date(
        now.getFullYear(),
        0,
        1
    );



    const today = await visits.countDocuments({
        visitTime: {
            $gte: startToday
        }
    });


    const weekly = await visits.countDocuments({
        visitTime: {
            $gte: startWeek
        }
    });


    const monthly = await visits.countDocuments({
        visitTime: {
            $gte: startMonth
        }
    });


    const yearly = await visits.countDocuments({
        visitTime: {
            $gte: startYear
        }
    });



    return {
        today,
        weekly,
        monthly,
        yearly
    };

}



async function getTotalVisitors() {

    const db = await connectMongo();

    const visits = db.collection("visit");


    const total = await visits.countDocuments();


    return total;

}

module.exports = {
    getStats,
    createVisit,
    getChart,
    getTotalVisitors
};