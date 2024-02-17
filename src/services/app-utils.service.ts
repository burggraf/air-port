import type { App } from '$models/interfaces';
import { pb } from '$services/backend.service';
export const checkDomainAvailability = async (domain: string) => {
    return true;
    let retval = false
    if (!domain) {
        return retval;
    }
    try {
        const { data, error } = await pb.send(`/check-domain/${domain}`, {
			method: 'GET',
		})
        if (error) {
            console.error('ERROR checking domain ' + domain, error)
            return false;
        } else {
            if (data === 0)
                retval = true;
            else
                retval = false;
        }
    } catch (err: any) {
        console.error('ERROR checking domain ' + domain, err)
        return false;
    }
    return retval;
}
