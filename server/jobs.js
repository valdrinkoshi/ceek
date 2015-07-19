var _ = require('underscore');


var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

var Job = Parse.Object.extend('Job');

// TODO load more jobs from different APIs
function getJobs() {
    var data = {
        method: 'GET',
        url: 'https://jobs.github.com/positions.json',
        params: {
            description: 'software engineer',
            location: 'san francisco'
        },
        headers: {
            'User-Agent': 'Parse.com Cloud Code'
        }
    };
    return Parse.Cloud.httpRequest(data).then(function (response) {
        return response.data;
    });
}

function getContact(rawData) {
    var text = JSON.stringify(rawData);
    var emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
    return _.uniq(emails, false, function (email) {
        return email.toLowerCase();
    }).join('; ');
}

function saveJob(jobData) {
    var contact = getContact(jobData);
    var job = new Job();
    job.setACL(restrictedAcl);
    return job.save({
        contact: contact,
        rawData: jobData
    }, {useMasterKey: true});
}

function saveJobs(jobs) {
    var promises = _.map(jobs, saveJob);
    return Parse.Promise.when(promises);
}

/**
 * @name isNewJob
 * @param job
 * @returns {Promise} always resolved, pass job object only if new
 */
function isNewJob(job) {
    var query = new Parse.Query(Job);
    // TODO use better way to see if is the same job, e.g. build hashKey
    query.equalTo('rawData', job);
    return query.first({useMasterKey: true})
        .then(function (jobObj) {
            if (jobObj) {
                job = undefined;
            }
        })
        .always(function () {
            return Parse.Promise.as(job);
        });
}

function filterJobs(jobs) {
    console.log('filterJobs: jobs ' + jobs.length);
    var promises = _.map(jobs, isNewJob);
    return Parse.Promise.when(promises).then(function () {
        var newJobs = _.filter(arguments, _.isObject);
        console.log('filterJobs: newJobs ' + newJobs.length);
        return newJobs;
    });
}

Parse.Cloud.job('loadJobs', function (request, status) {
    Parse.Cloud.useMasterKey();
    getJobs()
        .then(filterJobs)
        .then(saveJobs)
        .then(function () {
            status.success('Saved successfully ' + arguments.length + ' new jobs');
        }, function (error) {
            status.error('Failed to save new jobs. ' + error);
        });
});