var _ = require('underscore');


var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

var Job = Parse.Object.extend('Job');

var providers = {
    github: {
        requestData: {
            method: 'GET',
            url: 'https://jobs.github.com/positions.json',
            params: {
                description: 'software engineer',
                location: 'san francisco'
            },
            headers: {
                'User-Agent': 'Parse.com Cloud Code'
            }
        },
        mapping: {
            jobsList: '',
            id: 'id',
            title: 'title',
            url: 'url',
            type: 'type',
            postedAt: 'created_at',
            companyName: 'company',
            companyUrl: 'company_url'
        }
    },
    authenticJobs: {
        requestData: {
            method: 'GET',
            url: 'http://www.authenticjobs.com/api/',
            params: {
                api_key: '9f03f93d35cf373c7ae4060eca263f1f',
                format: 'json',
                method: 'aj.jobs.search'
            },
            headers: {
                'User-Agent': 'Parse.com Cloud Code'
            }
        },
        mapping: {
            jobsList: 'listings.listing',
            id: 'id',
            title: 'title',
            url: 'url',
            type: 'type',
            postedAt: 'post_date',
            companyName: 'company.name',
            companyUrl: 'company.url',
            contact: 'apply_email'
        }
    }
};

Parse.Cloud.job('loadJobs', loadJobs);

function loadJobs(request, status) {
    Parse.Cloud.useMasterKey();
    return getJobs()
        .then(saveJobs)
        .then(function () {
            status.success('Saved successfully ' + arguments.length + ' new jobs');
        }, function (error) {
            status.error('Failed to save new jobs. ' + error);
        });
}

function getJobs() {
    var promises = _.map(providers, getJobjsForProvider);
    return Parse.Promise.when(promises).then(function () {
        //arguments are each single promise result, which is an array of jobs
        var jobs = _.flatten(arguments);
        return jobs;
    });
}

function getJobjsForProvider(providerData, providerName) {
    return Parse.Cloud.httpRequest(providerData.requestData)
        .then(function (response) {
            return parseJobs(response.data, providerName);
        }, function (error) {
            console.log('getJobjsForProvider failed: ' + providerName);
            console.log(error);
            return Parse.Promise.as([]);
        });
}

function saveJobs(jobs) {
    var promises = _.map(jobs, saveJob);
    return Parse.Promise.when(promises);
}

function saveJob(jobData) {
    return findJob(jobData).then(function (job) {
        job = job || new Job();
        job.setACL(restrictedAcl);
        return job.save(jobData, {useMasterKey: true});
    });
}

function findJob(jobData) {
    var query = new Parse.Query(Job);
    query.equalTo('jobId', jobData.jobId);
    query.equalTo('provider', jobData.provider);
    return query.first({useMasterKey: true});
}

function parseJobs(jobs, provider) {
    jobs = getValue(jobs, provider, 'jobsList');
    var parsed = _.map(jobs, function (job) {
        return parseJob(job, provider);
    });
    _.remove(parsed, _.isUndefined);
    return parsed;
}

function parseJob(job, provider) {
    var contact = getContact(job, provider);
    if (contact) {
        return {
            provider: provider,
            id: getValue(job, provider, 'id'),
            url: getValue(job, provider, 'url'),
            title: getValue(job, provider, 'title'),
            type: getValue(job, provider, 'type'),
            postedAt: getValue(job, provider, 'postedAt'),
            companyName: getValue(job, provider, 'companyName'),
            companyUrl: getValue(job, provider, 'companyUrl'),
            contact: contact,
            rawData: job
        };
    }
}

function getContact(rawData, provider) {
    var text = JSON.stringify(rawData);
    var emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
    return _.uniq(emails, false, function (email) {
        return email.toLowerCase();
    }).join('; ');
}

function getValue(data, provider, key) {
    var path = getProviderMapping(provider)[key] || '';
    var keys = path.split('.');
    var result = data;
    _.forEach(keys, function (k) {
        if (!k.length) {
            //stop the loop if no key
            return false;
        }
        var squareStart = k.indexOf('[');
        var squareEnd = k.indexOf(']');
        if (squareStart > 0 && squareEnd > squareStart) {
            var i = parseInt(k.substr(squareStart + 1, squareEnd), 10);
            k = k.substr(0, squareStart);
            result = result[k][i];
        }
        else {
            result = result[k];
        }
        if (!result) {
            //stop the loop
            return false;
        }
    });
    return result;
}

function getProviderMapping(provider) {
    return getProviderData(provider)['mapping'] || {};
}

function getProviderData(provider) {
    return providers[provider] || {};
}